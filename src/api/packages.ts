import api from './axiosClient';
import type {
  Package,
  CreatePackageDto,
  UpdatePackageDto,
  PackagePublicHistoryDto,
  PackageInternalHistoryDto,
  PagedResponse,
} from '../types/packages';

export async function getPackages(page = 1, pageSize = 20): Promise<PagedResponse<Package>> {
  const res = await api.get('/api/packages', { params: { page, pageSize } });
  return res.data;
}

export async function getPackageById(id: string): Promise<Package> {
  const res = await api.get(`/api/packages/${id}`);
  return res.data;
}

export async function createPackage(payload: CreatePackageDto): Promise<Package> {
  const res = await api.post('/api/packages', payload);
  return res.data;
}

export async function updatePackage(id: string, payload: UpdatePackageDto): Promise<Package> {
  const res = await api.put(`/api/packages/${id}`, payload);
  return res.data;
}

export async function deliverPackage(id: string): Promise<Package> {
  const res = await api.post(`/api/packages/${id}/deliver`);
  return res.data;
}

export async function cancelPackage(id: string): Promise<Package> {
  const res = await api.post(`/api/packages/${id}/cancel`);
  return res.data;
}

export async function getPackageByTracking(trackingNumber: string): Promise<PackagePublicHistoryDto | null> {
  const res = await api.get(`/api/packages/tracking/${trackingNumber}`);
  return res.data;
}

export async function getPackageHistory(id: string): Promise<PackageInternalHistoryDto[]> {
  const res = await api.get(`/api/packages/${id}/history`);
  return res.data;
}
