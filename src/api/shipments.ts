import Shipment, { AssignDriverDto, CreateShipmentDto, PagedResultDto } from '../types/shipments';
import api from './axiosClient';


export async function createShipment(payload: CreateShipmentDto): Promise<Shipment> {
  const res = await api.post('/api/shipments', payload);
  // Backend returns Result<ShipmentDto>, extract the value
  return res.data?.value ?? res.data;
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
  // Backend returns Result<PagedResultDto<Shipment>>, extract the value
  return res.data?.value ?? res.data;
}

export async function getMyShipments(): Promise<Shipment[]> {
  const res = await api.get('/api/shipments/me');
  // Backend returns Result<IEnumerable<ShipmentDto>>, extract the value
  return res.data?.value ?? res.data;
}

export async function getShipmentById(id: string): Promise<Shipment> {
  const res = await api.get(`/api/shipments/${id}`);
  // Backend returns Result<ShipmentDto>, extract the value
  return res.data?.value ?? res.data;
}

export async function addPackageToShipment(id: string, payload: { packageId: string }): Promise<Shipment> {
  const res = await api.post(`/api/shipments/${id}/packages`, payload);
  // Backend returns Result<ShipmentDto>, extract the value
  return res.data?.value ?? res.data;
}

export async function dispatchShipment(id: string): Promise<boolean> {
  const res = await api.post(`/api/shipments/${id}/dispatch`);
  // Backend returns Result<bool>, extract the value
  return res.data?.value ?? res.data;
}

export async function assignDriver(id: string, payload: AssignDriverDto): Promise<boolean> {
  const res = await api.post(`/api/shipments/${id}/assign-driver`, payload);
  // Backend returns Result<bool>, extract the value
  return res.data?.value ?? res.data;
}

export async function arriveShipment(id: string): Promise<boolean> {
  const res = await api.post(`/api/shipments/${id}/arrive`);
  // Backend returns Result<bool>, extract the value
  return res.data?.value ?? res.data;
}

export async function completeShipment(id: string): Promise<boolean> {
  const res = await api.post(`/api/shipments/${id}/complete`);
  // Backend returns Result<bool>, extract the value
  return res.data?.value ?? res.data;
}

export async function cancelShipment(id: string): Promise<boolean> {
  const res = await api.post(`/api/shipments/${id}/cancel`);
  // Backend returns Result<bool>, extract the value
  return res.data?.value ?? res.data;
}

export default {};
