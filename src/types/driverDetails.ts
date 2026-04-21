export interface DriverDetailsWithUser {
  id: string;
  userId: string;
  driverId?: string; // Guid of the Driver entity if it exists
  firstName: string;
  lastName: string;
  email: string;
  isUserActive: boolean;
  licenseNumber: string;
  licenseType: string;
  licenseExpiry: string;
  insuranceExpiry: string;
  assignedVehicleId?: string;
  assignedVehiclePlate?: string | null;
  assignedVehicleMake?: string | null;
  assignedVehicleModel?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface DriverDetailsListResponse {
  isSuccess: boolean;
  value?: {
    items: DriverDetailsWithUser[];
    total: number;
    page: number;
    pageSize: number;
  };
  error?: string;
}
