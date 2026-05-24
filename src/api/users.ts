import type { CreateUserDto, PagedUserResult, UpdateUserDto, User } from '../types/users';
import { requestGraphQL, unwrapResult } from './graphqlClient';

type UsersQueryResponse = {
  users?: PagedUserResult;
  user?: User | null;
  createUser?: User;
  updateUser?: User;
  toggleUserStatus?: boolean;
};

const USER_FIELDS = `
  id
  userName
  email
  firstName
  lastName
  emailConfirmed
  isActive
  roles
  createdAt
`;

const USERS_QUERY = `
  query GetUsers($page: Int!, $pageSize: Int!) {
    users(page: $page, pageSize: $pageSize) {
      items {
        ${USER_FIELDS}
      }
      total
      page
      pageSize
    }
  }
`;

const USER_QUERY = `
  query GetUser($id: ID!) {
    user(id: $id) {
      ${USER_FIELDS}
    }
  }
`;

const CREATE_USER_MUTATION = `
  mutation CreateUser($firstName: String!, $lastName: String!, $email: String!, $password: String!, $roles: [String!]) {
    createUser(firstName: $firstName, lastName: $lastName, email: $email, password: $password, roles: $roles) {
      ${USER_FIELDS}
    }
  }
`;

const UPDATE_USER_MUTATION = `
  mutation UpdateUser($id: ID!, $firstName: String, $lastName: String, $email: String, $roles: [String!]) {
    updateUser(id: $id, firstName: $firstName, lastName: $lastName, email: $email, roles: $roles) {
      ${USER_FIELDS}
    }
  }
`;

const TOGGLE_USER_STATUS_MUTATION = `
  mutation ToggleUserStatus($id: ID!, $isActive: Boolean!) {
    toggleUserStatus(id: $id, isActive: $isActive)
  }
`;

export const getUsersAPI = async (page = 1, limit = 15): Promise<PagedUserResult> => {
  const response = await requestGraphQL<UsersQueryResponse, { page: number; pageSize: number }>(
    USERS_QUERY,
    { page, pageSize: limit },
  );

  return unwrapResult(response.users);
};

export const getUserByIdAPI = async (id: string): Promise<User> => {
  const response = await requestGraphQL<UsersQueryResponse, { id: string }>(USER_QUERY, { id });
  return unwrapResult(response.user);
};

export const createUserAPI = async (data: CreateUserDto): Promise<User> => {
  const response = await requestGraphQL<UsersQueryResponse, CreateUserDto>(CREATE_USER_MUTATION, data);
  return unwrapResult(response.createUser);
};

export const updateUserAPI = async (id: string, data: UpdateUserDto): Promise<User> => {
  const response = await requestGraphQL<UsersQueryResponse, UpdateUserDto & { id: string }>(
    UPDATE_USER_MUTATION,
    { id, ...data },
  );
  return unwrapResult(response.updateUser);
};

export const toggleUserStatusAPI = async (id: string, isActive: boolean): Promise<boolean> => {
  const response = await requestGraphQL<UsersQueryResponse, { id: string; isActive: boolean }>(
    TOGGLE_USER_STATUS_MUTATION,
    { id, isActive },
  );

  return unwrapResult(response.toggleUserStatus);
};
