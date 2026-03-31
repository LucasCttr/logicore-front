import UserDto, { AuthResponseDto, LoginUserDto, RegisterUserDto } from '../types/auth';
import api from './axiosClient';


export async function register(payload: RegisterUserDto): Promise<UserDto> {
  const res = await api.post('/api/auth/register', payload);
  return res.data;
}

export async function login(payload: LoginUserDto): Promise<AuthResponseDto> {
  // API expects properties named `Email` and `Password` (PascalCase)
  const body = {
    Email: (payload as any).email ?? (payload as any).Email,
    Password: (payload as any).password ?? (payload as any).Password,
  };
  const res = await api.post('/api/auth/login', body);
  return res.data;
}

export default {};
