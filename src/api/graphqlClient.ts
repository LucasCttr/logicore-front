type GraphQLErrorLike = {
  message?: string;
  extensions?: {
    code?: string;
  };
};

type GraphQLResponse<TData> = {
  data?: TData;
  errors?: GraphQLErrorLike[];
};

type GraphQLClientOptions = {
  authenticated?: boolean;
};

type AuthResponseLike = {
  token?: string | null;
  refreshToken?: string | null;
  user?: {
    [key: string]: unknown;
  } | null;
};

const defaultApiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5074';
const graphQLEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_URL || `${defaultApiBase.replace(/\/$/, '')}/graphql`;

const REFRESH_MUTATION = `
  mutation Refresh($refreshToken: String) {
    refresh(refreshToken: $refreshToken) {
      token
      refreshToken
      user {
        id
        email
        name
        roles
      }
    }
  }
`;

let refreshPromise: Promise<string | null> | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
}

function storeAuthToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
}

function clearAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

function normalizeUser(user: AuthResponseLike['user']): AuthResponseLike['user'] {
  if (!user || typeof user !== 'object') return user;

  const firstName = typeof user.firstName === 'string' ? user.firstName : '';
  const lastName = typeof user.lastName === 'string' ? user.lastName : '';
  const userName = typeof user.userName === 'string' ? user.userName : '';
  const name = `${firstName} ${lastName}`.trim() || userName || null;

  return {
    ...user,
    name,
  };
}

function redirectToLogin(): void {
  if (typeof window === 'undefined') return;
  window.location.href = '/login';
}

function isAuthStatus(status: number): boolean {
  return status === 401 || status === 403;
}

function isAuthErrorCode(code?: string): boolean {
  return code === 'AUTH_NOT_AUTHORIZED' || code === 'UNAUTHENTICATED';
}

function hasAuthGraphQLError(errors?: GraphQLErrorLike[]): boolean {
  return errors?.some((error) => isAuthErrorCode(error.extensions?.code)) ?? false;
}

function isAuthMessage(message: string): boolean {
  return /unauthorized|forbidden|missing refresh token|invalid refresh token|token is expired|signature validation failed|invalid token|session expired/i.test(message);
}

function shouldRefreshOnError(error: GraphQLRequestError): boolean {
  return error.status === 401 || error.status === 403 || hasAuthGraphQLError(error.errors) || isAuthMessage(error.message);
}

export class GraphQLRequestError extends Error {
  status: number;
  errors?: GraphQLErrorLike[];

  constructor(message: string, status: number, errors?: GraphQLErrorLike[]) {
    super(message);
    this.name = 'GraphQLRequestError';
    this.status = status;
    this.errors = errors;
  }
}

async function performRequest<TData, TVariables>(
  query: string,
  variables?: TVariables,
  options: GraphQLClientOptions = {},
): Promise<TData> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.authenticated !== false) {
    const token = getAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(graphQLEndpoint, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  if (isAuthStatus(response.status)) {
    throw new GraphQLRequestError('Unauthorized', response.status);
  }

  let payload: GraphQLResponse<TData> | null = null;
  try {
    payload = (await response.json()) as GraphQLResponse<TData>;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message = payload?.errors?.[0]?.message || `Request failed with status ${response.status}`;
    throw new GraphQLRequestError(message, response.status, payload?.errors);
  }

  if (payload?.errors?.length) {
    const message = payload.errors[0]?.message || 'Request failed';
    const status = hasAuthGraphQLError(payload.errors) || isAuthMessage(message) ? 401 : 400;
    throw new GraphQLRequestError(message, status, payload.errors);
  }

  if (!payload || payload.data === undefined) {
    throw new GraphQLRequestError('Empty GraphQL response', 500);
  }

  return payload.data;
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const data = await performRequest<{ refresh: AuthResponseLike } , { refreshToken: string | null }>(
      REFRESH_MUTATION,
      { refreshToken: getStoredRefreshToken() },
      { authenticated: false },
    );

    const token = data.refresh?.token ?? null;
    if (token) storeAuthToken(token);
    if (typeof window !== 'undefined' && data.refresh?.refreshToken) {
      localStorage.setItem('refreshToken', data.refresh.refreshToken);
    }
    if (typeof window !== 'undefined' && data.refresh?.user) {
      localStorage.setItem('user', JSON.stringify(normalizeUser(data.refresh.user)));
    }

    return token;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

export async function requestGraphQL<TData, TVariables = Record<string, unknown>>(
  query: string,
  variables?: TVariables,
  options: GraphQLClientOptions = {},
): Promise<TData> {
  try {
    return await performRequest<TData, TVariables>(query, variables, options);
  } catch (error) {
    const requestError = error instanceof GraphQLRequestError ? error : new GraphQLRequestError('Request failed', 500);

    if (options.authenticated === false) {
      throw requestError;
    }

    if (shouldRefreshOnError(requestError)) {
      try {
        const refreshedToken = await refreshAccessToken();
        if (!refreshedToken) {
          clearAuth();
          redirectToLogin();
          throw requestError;
        }

        return await performRequest<TData, TVariables>(query, variables, options);
      } catch (refreshError) {
        clearAuth();
        redirectToLogin();
        throw refreshError;
      }
    }

    if (requestError.status === 403) {
      clearAuth();
      redirectToLogin();
    }

    throw requestError;
  }
}

export function unwrapResult<T>(value: T | { isSuccess?: boolean; value?: T; error?: string } | null | undefined): T {
  if (isRecord(value) && 'isSuccess' in value) {
    const result = value as { isSuccess?: boolean; value?: T; error?: string };
    if (result.isSuccess && result.value !== undefined) return result.value;
    throw new Error(result.error || 'Request failed');
  }

  if (value === null || value === undefined) {
    throw new Error('Request failed');
  }

  return value as T;
}

export function normalizePagedResponse<T>(items: T[], total: number, page: number, pageSize: number) {
  return { items, total, page, pageSize };
}
