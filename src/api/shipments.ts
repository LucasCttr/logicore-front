import Shipment, { AssignDriverDto, CreateShipmentDto, PagedResultDto } from '../types/shipments';
import api from './axiosClient';


export async function createShipment(payload: CreateShipmentDto): Promise<Shipment> {
  const res = await api.post('/api/shipments', payload);
  return res.data;
}

export async function getShipments(
  page = 1,
  pageSize = 10,
  sortBy?: string,
  sortDir?: string,
  status?: string,
  q?: string
): Promise<PagedResultDto<Shipment>> {
  const res = await api.get('/api/shipments', { params: { page, pageSize, sortBy, sortDir, status, q } });
  return res.data;
}

export async function getMyShipments(): Promise<Shipment[]> {
  const res = await api.get('/api/shipments/me');
  return res.data;
}

export async function getShipmentById(id: string): Promise<Shipment> {
  const res = await api.get(`/api/shipments/${id}`);
  return res.data;
}

export async function addPackageToShipment(id: string, payload: { packageId: string }): Promise<Shipment> {
  const res = await api.post(`/api/shipments/${id}/packages`, payload);
  return res.data;
}

export async function dispatchShipment(id: string): Promise<boolean> {
  const res = await api.post(`/api/shipments/${id}/dispatch`);
  return res.data;
}

export async function assignDriver(id: string, payload: AssignDriverDto): Promise<boolean> {
  const res = await api.post(`/api/shipments/${id}/assign-driver`, payload);
  return res.data;
}

export async function arriveShipment(id: string): Promise<boolean> {
  const res = await api.post(`/api/shipments/${id}/arrive`);
  return res.data;
}

export async function completeShipment(id: string): Promise<boolean> {
  const res = await api.post(`/api/shipments/${id}/complete`);
  return res.data;
}

export async function cancelShipment(id: string): Promise<boolean> {
  const res = await api.post(`/api/shipments/${id}/cancel`);
  return res.data;
}

export default {};
