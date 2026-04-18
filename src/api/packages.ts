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
  const payload = res.data;
  // Backend wraps responses in Result<T>
  if (payload && typeof payload === 'object' && 'isSuccess' in payload) {
    if (payload.isSuccess) return payload.value as PagedResponse<Package>;
    throw new Error(payload.error || 'Failed to fetch packages');
  }
  return payload as PagedResponse<Package>;
}

export async function getPackageById(id: string): Promise<Package> {
  const res = await api.get(`/api/packages/${id}`);
  // Backend wraps responses in Result<T>
  if (res.data && typeof res.data === 'object' && 'isSuccess' in res.data) {
    if (res.data.isSuccess) return res.data.value as Package;
    throw new Error(res.data.error || 'Failed to fetch package');
  }
  return res.data as Package;
}

export async function createPackage(payload: CreatePackageDto): Promise<Package> {
  const res = await api.post('/api/packages', payload);
  // Backend wraps responses in Result<T>
  if (res.data && typeof res.data === 'object' && 'isSuccess' in res.data) {
    if (res.data.isSuccess) return res.data.value as Package;
    throw new Error(res.data.error || 'Failed to create package');
  }
  return res.data as Package;
}

export async function updatePackage(id: string, payload: UpdatePackageDto): Promise<Package> {
  const res = await api.put(`/api/packages/${id}`, payload);
  // Backend wraps responses in Result<T>
  if (res.data && typeof res.data === 'object' && 'isSuccess' in res.data) {
    if (res.data.isSuccess) return res.data.value as Package;
    throw new Error(res.data.error || 'Failed to update package');
  }
  return res.data as Package;
}

export async function deliverPackage(id: string): Promise<Package> {
  const res = await api.post(`/api/packages/${id}/deliver`);
  // Backend wraps responses in Result<T>
  if (res.data && typeof res.data === 'object' && 'isSuccess' in res.data) {
    if (res.data.isSuccess) return res.data.value as Package;
    throw new Error(res.data.error || 'Failed to deliver package');
  }
  return res.data as Package;
}

export async function cancelPackage(id: string): Promise<Package> {
  const res = await api.post(`/api/packages/${id}/cancel`);
  // Backend wraps responses in Result<T>
  if (res.data && typeof res.data === 'object' && 'isSuccess' in res.data) {
    if (res.data.isSuccess) return res.data.value as Package;
    throw new Error(res.data.error || 'Failed to cancel package');
  }
  return res.data as Package;
}

export async function movePackageToDepot(id: string): Promise<boolean> {
  const res = await api.post(`/api/packages/${id}/move-to-depot`);
  // Backend wraps responses in Result<T>
  if (res.data && typeof res.data === 'object' && 'isSuccess' in res.data) {
    if (res.data.isSuccess) return res.data.value as boolean;
    throw new Error(res.data.error || 'Failed to move package to depot');
  }
  return res.data as boolean;
}

export async function getPackageByTracking(trackingNumber: string): Promise<PackagePublicHistoryDto | null> {
  const res = await api.get(`/api/packages/tracking/${trackingNumber}`);
  // Backend wraps responses in Result<T>
  if (res.data && typeof res.data === 'object' && 'isSuccess' in res.data) {
    if (res.data.isSuccess) return res.data.value as PackagePublicHistoryDto;
    throw new Error(res.data.error || 'Failed to fetch package');
  }
  return res.data as PackagePublicHistoryDto;
}

export async function getPackageHistory(id: string): Promise<PackageInternalHistoryDto[]> {
  const res = await api.get(`/api/packages/${id}/history`);
  // Backend wraps responses in Result<T>
  if (res.data && typeof res.data === 'object' && 'isSuccess' in res.data) {
    if (res.data.isSuccess) return res.data.value as PackageInternalHistoryDto[];
    throw new Error(res.data.error || 'Failed to fetch history');
  }
  return res.data as PackageInternalHistoryDto[];
}

export async function markPackageAsDelivered(
  id: string, 
  data: { deliveryLatitude?: number; deliveryLongitude?: number; deliveryNotes?: string }
): Promise<boolean> {
  const res = await api.post(`/api/packages/${id}/mark-delivered`, data);
  // Backend wraps responses in Result<T>
  if (res.data && typeof res.data === 'object' && 'isSuccess' in res.data) {
    if (res.data.isSuccess) return res.data.value as boolean;
    throw new Error(res.data.error || 'Failed to mark package as delivered');
  }
  return res.data as boolean;
}

export async function markPackageAsCollected(
  id: string, 
  data: { collectionNotes?: string } = {}
): Promise<boolean> {
  const res = await api.post(`/api/packages/${id}/mark-collected`, data);
  // Backend wraps responses in Result<T>
  if (res.data && typeof res.data === 'object' && 'isSuccess' in res.data) {
    if (res.data.isSuccess) return res.data.value as boolean;
    throw new Error(res.data.error || 'Failed to mark package as collected');
  }
  return res.data as boolean;
}
