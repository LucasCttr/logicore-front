import { gql } from 'graphql-tag';
import type {
  CreateUserMutation,
  CreateUserMutationVariables,
  GetUserQuery,
  GetUserQueryVariables,
  GetUsersQuery,
  GetUsersQueryVariables,
  ToggleUserStatusMutation,
  ToggleUserStatusMutationVariables,
  UpdateUserMutation,
  UpdateUserMutationVariables,
} from './__generated__/graphql-types';
import type { CreateUserDto, PagedUserResult, UpdateUserDto, User } from '../types/users';
import { requestGraphQL, unwrapResult } from './graphqlClient';

function normalizeUser(user: { roles?: string[] | null; [key: string]: unknown } | null | undefined): User {
  if (!user) {
    throw new Error('Request failed');
  }

  return {
    ...(user as User),
    roles: user.roles ?? undefined,
  };
}

const USERS_QUERY = gql`
  query GetUsers($page: Int!, $pageSize: Int!) {
    users(page: $page, pageSize: $pageSize) {
      items {
        id
        userName
        email
        firstName
        lastName
        emailConfirmed
        isActive
        roles
        createdAt
      }
      total
      page
      pageSize
    }
  }
`;

const USER_QUERY = gql`
  query GetUser($id: UUID!) {
    user(id: $id) {
      id
      userName
      email
      firstName
      lastName
      emailConfirmed
      isActive
      roles
      createdAt
    }
  }
`;

const CREATE_USER_MUTATION = gql`
  mutation CreateUser($firstName: String!, $lastName: String!, $email: String!, $password: String!) {
    createUser(firstName: $firstName, lastName: $lastName, email: $email, password: $password) {
      id
      userName
      email
      firstName
      lastName
      emailConfirmed
      isActive
      roles
      createdAt
    }
  }
`;

const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($id: UUID!, $firstName: String, $lastName: String, $email: String, $roles: [String!]) {
    updateUser(id: $id, firstName: $firstName, lastName: $lastName, email: $email, roles: $roles) {
      id
      userName
      email
      firstName
      lastName
      emailConfirmed
      isActive
      roles
      createdAt
    }
  }
`;

const TOGGLE_USER_STATUS_MUTATION = gql`
  mutation ToggleUserStatus($id: UUID!, $isActive: Boolean!) {
    toggleUserStatus(id: $id, isActive: $isActive)
  }
`;

export const getUsersAPI = async (page = 1, limit = 15): Promise<PagedUserResult> => {
  const response = await requestGraphQL<GetUsersQuery, GetUsersQueryVariables>(
    USERS_QUERY,
    { page, pageSize: limit },
  );

  const result = unwrapResult(response.users);
  return {
    ...result,
    items: result.items.map((user) => normalizeUser(user)),
  };
};

export const getUserByIdAPI = async (id: string): Promise<User> => {
  const response = await requestGraphQL<GetUserQuery, GetUserQueryVariables>(USER_QUERY, { id });
  return normalizeUser(unwrapResult(response.user));
};

export const createUserAPI = async (data: CreateUserDto): Promise<User> => {
  const response = await requestGraphQL<CreateUserMutation, CreateUserMutationVariables>(CREATE_USER_MUTATION, {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    password: data.password,
  });
  return normalizeUser(unwrapResult(response.createUser));
};

export const updateUserAPI = async (id: string, data: UpdateUserDto): Promise<User> => {
  const response = await requestGraphQL<UpdateUserMutation, UpdateUserMutationVariables>(
    UPDATE_USER_MUTATION,
    { id, ...data },
  );
  return normalizeUser(unwrapResult(response.updateUser));
};

export const toggleUserStatusAPI = async (id: string, isActive: boolean): Promise<boolean> => {
  const response = await requestGraphQL<ToggleUserStatusMutation, ToggleUserStatusMutationVariables>(
    TOGGLE_USER_STATUS_MUTATION,
    { id, isActive },
  );

  return unwrapResult(response.toggleUserStatus);
};
