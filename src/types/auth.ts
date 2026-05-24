export type UserDto = {
  id: string;
  userName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  emailConfirmed?: boolean;
  isActive?: boolean;
  roles?: string[];
  createdAt?: string;
  name?: string | null;
  [key: string]: unknown;
};

export type RegisterUserDto = {
  email: string;
  password: string;
  name?: string;
};

export type LoginUserDto = {
  email: string;
  password: string;
};

export type AuthResponseDto = {
  token: string;
  user: UserDto;
};

export default UserDto;
