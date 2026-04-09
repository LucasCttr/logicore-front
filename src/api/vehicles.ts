import api from './axiosClient';

export type Vehicle = {
  id: string;
  plate: string;
  model: string;
  maxWeightCapacity: number;
  maxVolumeCapacity: number;
  isActive?: boolean;
  [key: string]: any;
};

export async function getVehicles(): Promise<{ items: Vehicle[] }> {
  const res = await api.get('/api/vehicles');
  const payload: any = res.data;
  return { items: payload?.value ?? payload?.Value ?? payload ?? [] };
}

export async function getVehicleById(id: string): Promise<Vehicle> {
  const res = await api.get(`/api/vehicles/${id}`);
  const payload: any = res.data;
  return payload?.value ?? payload?.Value ?? payload;
}

export async function getAvailableVehicles(): Promise<Vehicle[]> {
  const res = await api.get('/api/vehicles/available');
  const payload: any = res.data;
  return payload?.value ?? payload?.Value ?? payload ?? [];
}
