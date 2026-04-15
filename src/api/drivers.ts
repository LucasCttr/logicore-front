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

// Get drivers with details from DriverDetails table (new endpoint)
export async function getDriversWithDetails(
  page: number = 1,
  pageSize: number = 15,
  search?: string,
  isActive?: boolean
): Promise<any> {
  const params: any = { page, pageSize };
  if (search) params.search = search;
  if (isActive !== undefined) params.isActive = isActive;
  
  const res = await api.get('/api/drivers/details', { params });
  return res.data;
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

export async function assignVehicleToDriver(driverId: string, vehicleId: string | null): Promise<Driver> {
  const body: any = { VehicleId: vehicleId || null };
  const res = await api.put(`/api/drivers/${driverId}/assign-vehicle`, body);
  const result: any = res.data;
  return result?.value ?? result?.Value ?? result;
}

export async function updateDriver(id: string, payload: any): Promise<Driver> {
  // backend expects PascalCase property names for model binding
  const body: any = {
    FirstName: payload.firstName,
    LastName: payload.lastName,
    Email: payload.email,
    LicenseNumber: payload.licenseNumber,
    Phone: payload.phone,
  };
  const res = await api.put(`/api/drivers/${id}`, body);
  const result: any = res.data;
  return result?.value ?? result?.Value ?? result;
}
