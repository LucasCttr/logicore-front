import api from './axiosClient';
import { Driver, RegisterDriverDto, UpdateDriverStatusDto } from '../types/drivers';

export async function getDrivers(): Promise<Driver[]> {
  const res = await api.get('/api/drivers');
  return res.data;
}

export async function getDriverById(id: string): Promise<Driver> {
  const res = await api.get(`/api/drivers/${id}`);
  return res.data;
}

export async function getAvailableDrivers(): Promise<Driver[]> {
  const res = await api.get('/api/drivers/available');
  return res.data;
}

export async function getMyDriverProfile(): Promise<Driver> {
  const res = await api.get('/api/drivers/me');
  return res.data;
}

export async function registerDriver(payload: RegisterDriverDto): Promise<Driver> {
  const res = await api.post('/api/drivers/register', payload);
  return res.data;
}

export async function updateDriverStatus(id: string, payload: UpdateDriverStatusDto): Promise<Driver> {
  const res = await api.put(`/api/drivers/${id}/status`, payload);
  return res.data;
}
