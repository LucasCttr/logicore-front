export type Shipment = {
  id: string;
  reference?: string | null;
  status?: string | null;
  driverId?: string | null;
  vehicleId?: string | null;
  createdAt?: string | null;
  [key: string]: any;
};

export type CreateShipmentDto = {
  driverId: string;
  vehicleId: string;
  packageIds: string[];
  estimatedDelivery: string; // ISO date string
};

export type AssignDriverDto = {
  driverId: string;
};

export type PagedResultDto<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export default Shipment;
