import type UserDto from '../types/auth';
import type { AuthResponseDto, LoginUserDto, RegisterUserDto } from '../types/auth';
import { getStoredRefreshToken, requestGraphQL, unwrapResult } from './graphqlClient';

type AuthMutationResponse = {
  register?: UserDto;
  login?: AuthResponseDto;
  refresh?: AuthResponseDto;
};

const AUTH_USER_FIELDS = `
  id
  email
  name
  roles
`;

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
      refreshToken
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

  return unwrapResult(response.register);
}

export async function login(payload: LoginUserDto): Promise<AuthResponseDto> {
  const response = await requestGraphQL<AuthMutationResponse, LoginUserDto>(
    LOGIN_MUTATION,
    payload,
    { authenticated: false },
  );

  return unwrapResult(response.login);
}

export async function refresh(): Promise<AuthResponseDto> {
  const response = await requestGraphQL<AuthMutationResponse, { refreshToken: string | null }>(
    `
      mutation Refresh($refreshToken: String) {
        refresh(refreshToken: $refreshToken) {
          token
          refreshToken
          user {
            ${AUTH_USER_FIELDS}
          }
        }
      }
    `,
    { refreshToken: getStoredRefreshToken() },
    { authenticated: false },
  );

  return unwrapResult(response.refresh);
}

const authApi = { register, login, refresh };

export default authApi;
