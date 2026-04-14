export interface User {
  id: string;
  userName?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  emailConfirmed: boolean;
  isActive: boolean;
  roles?: string[];
  createdAt?: string;
  [key: string]: any;
}

export interface PagedUserResult {
  items: User[];
  total: number;
  page: number;
  pageSize: number;
}

export interface UserListResponse {
  isSuccess: boolean;
  value: PagedUserResult;
  error: string | null;
  type: number;
  responseTime: string;
}

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roles?: string[];
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  roles?: string[];
}
