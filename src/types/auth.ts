export type UserDto = {
  id: string;
  email?: string | null;
  name?: string | null;
  roles?: string[];
  [key: string]: any;
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
