import type UserDto from '../types/auth';
import type { AuthResponseDto, LoginUserDto, RegisterUserDto } from '../types/auth';
import { requestGraphQL, unwrapResult } from './graphqlClient';

type AuthMutationResponse = {
  register?: UserDto;
  login?: AuthResponseDto;
  refresh?: AuthResponseDto;
};

const AUTH_USER_FIELDS = `
  id
  email
  userName
  firstName
  lastName
  emailConfirmed
  isActive
  roles
  createdAt
`;

function normalizeUser(user: UserDto | null | undefined): UserDto | undefined {
  if (!user) return undefined;

  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();

  return {
    ...user,
    name: displayName || user.userName || null,
  };
}

const REGISTER_MUTATION = `
  mutation Register($firstName: String!, $lastName: String!, $email: String!, $password: String!) {
    register(firstName: $firstName, lastName: $lastName, email: $email, password: $password) {
      ${AUTH_USER_FIELDS}
    }
  }
`;

const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        ${AUTH_USER_FIELDS}
      }
    }
  }
`;

export async function register(payload: RegisterUserDto): Promise<UserDto> {
  const response = await requestGraphQL<AuthMutationResponse, RegisterUserDto>(
    REGISTER_MUTATION,
    payload,
    { authenticated: false },
  );

  return unwrapResult(normalizeUser(response.register));
}

export async function login(payload: LoginUserDto): Promise<AuthResponseDto> {
  const response = await requestGraphQL<AuthMutationResponse, LoginUserDto>(
    LOGIN_MUTATION,
    payload,
    { authenticated: false },
  );

  const authResponse = unwrapResult(response.login);

  return {
    ...authResponse,
    user: normalizeUser(authResponse.user) as UserDto,
  };
}

export async function refresh(): Promise<AuthResponseDto> {
  const response = await requestGraphQL<AuthMutationResponse>(
    `
      mutation Refresh {
        refresh {
          token
          user {
            ${AUTH_USER_FIELDS}
          }
        }
      }
    `,
    undefined,
    { authenticated: false },
  );

  const authResponse = unwrapResult(response.refresh);

  return {
    ...authResponse,
    user: normalizeUser(authResponse.user) as UserDto,
  };
}

const authApi = { register, login, refresh };

export default authApi;
