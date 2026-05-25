import { gql } from 'graphql-tag';
import type {
  LoginMutation,
  LoginMutationVariables,
  RefreshMutation,
  RegisterMutation,
  RegisterMutationVariables,
} from './__generated__/graphql-types';
import type UserDto from '../types/auth';
import type { AuthResponseDto, LoginUserDto, RegisterUserDto } from '../types/auth';
import { REFRESH_MUTATION, requestGraphQL, unwrapResult } from './graphqlClient';

function normalizeUser(user: UserDto | null | undefined): UserDto | undefined {
  if (!user) return undefined;

  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();

  return {
    ...user,
    name: displayName || user.userName || null,
  };
}

const REGISTER_MUTATION = gql`
  mutation Register($firstName: String!, $lastName: String!, $email: String!, $password: String!) {
    register(firstName: $firstName, lastName: $lastName, email: $email, password: $password) {
      id
      email
      userName
      firstName
      lastName
      emailConfirmed
      isActive
      roles
      createdAt
    }
  }
`;

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        userName
        firstName
        lastName
        emailConfirmed
        isActive
        roles
        createdAt
      }
    }
  }
`;

export async function register(payload: RegisterUserDto): Promise<UserDto> {
  const [firstName = '', ...rest] = (payload.name ?? '').trim().split(/\s+/);
  const lastName = rest.join(' ');

  const response = await requestGraphQL<RegisterMutation, RegisterMutationVariables>(
    REGISTER_MUTATION,
    { firstName, lastName, email: payload.email, password: payload.password },
    { authenticated: false },
  );

  return unwrapResult(normalizeUser(response.register));
}

export async function login(payload: LoginUserDto): Promise<AuthResponseDto> {
  const response = await requestGraphQL<LoginMutation, LoginMutationVariables>(
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
  const response = await requestGraphQL<RefreshMutation>(REFRESH_MUTATION, undefined, { authenticated: false });

  const authResponse = unwrapResult(response.refresh);

  return {
    ...authResponse,
    user: normalizeUser(authResponse.user) as UserDto,
  };
}

const authApi = { register, login, refresh };

export default authApi;
