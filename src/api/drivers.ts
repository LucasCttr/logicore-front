import api from './axiosClient';
import { Driver, RegisterDriverDto, UpdateDriverStatusDto } from '../types/drivers';

export async function getDrivers(): Promise<Driver[]> {
  const res = await api.get('/api/drivers');
  const payload: any = res.data;
  return payload?.value ?? payload?.Value ?? payload;
}

export async function getDriverById(id: string): Promise<Driver> {
  const res = await api.get(`/api/drivers/${id}`);
  const payload: any = res.data;
  return payload?.value ?? payload?.Value ?? payload;
}

export async function getAvailableDrivers(): Promise<Driver[]> {
  const res = await api.get('/api/drivers/available');
  const payload: any = res.data;
  return payload?.value ?? payload?.Value ?? payload;
}

export async function getMyDriverProfile(): Promise<Driver> {
  const res = await api.get('/api/drivers/me');
  const payload: any = res.data;
  return payload?.value ?? payload?.Value ?? payload;
}

export async function registerDriver(payload: RegisterDriverDto): Promise<Driver> {
  // backend expects PascalCase property names for model binding
  const body: any = {
    FirstName: payload.firstName,
    LastName: payload.lastName,
    Email: payload.email,
    Password: payload.password,
    LicenseNumber: payload.licenseNumber,
    Phone: payload.phone,
  };
  const res = await api.post('/api/drivers/register', body);
  const result: any = res.data;
  return result?.value ?? result?.Value ?? result;
}

export async function updateDriverStatus(id: string, payload: UpdateDriverStatusDto): Promise<Driver> {
  // backend expects PascalCase property `IsActive`
  const body: any = { IsActive: payload.isActive };
  const res = await api.put(`/api/drivers/${id}/status`, body);
  const result: any = res.data;
  return result?.value ?? result?.Value ?? result;
}
