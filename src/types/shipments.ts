export type Shipment = {
  id: string;
  routeCode?: string | null;
  status?: number | string | null;
  driverId?: string | null;
  vehicleId?: string | null;
  destinationLocationId?: number | null;
  createdAt?: string | null;
  estimatedDelivery?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  arrivedAt?: string | null;
  vehicleMaxWeightCapacity?: number | null;
  vehicleMaxVolumeCapacity?: number | null;
  packageIds?: string[] | null;
  [key: string]: any;
};

export type CreateShipmentDto = {
  driverId: string;
  vehicleId: string;
  packageIds: string[];
  estimatedDelivery: string; // ISO date string
  destinationLocationId?: number | null; // NULL = last-mile (door-to-door), number = depot-to-depot
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
