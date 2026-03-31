import api from './axiosClient';

export type Driver = {
  id: string;
  name: string;
  phone?: string | null;
  status?: string | null;
  [key: string]: any;
};

export async function getDrivers(): Promise<Driver[]> {
  const res = await api.get('/api/drivers');
  return res.data;
}

export async function getDriverById(id: string): Promise<Driver> {
  const res = await api.get(`/api/drivers/${id}`);
  return res.data;
}
