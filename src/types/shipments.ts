export enum ShipmentType {
  Pickup = 0,
  Transfer = 1,
  LastMile = 2,
}

export type Shipment = {
  id: string;
  routeCode?: string | null;
  status?: number | string | null;
  type?: ShipmentType | null;
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
  origin?: string | null;
  destination?: string | null;
  [key: string]: any;
};

export type CreateShipmentDto = {
  driverId: string;
  vehicleId: string;
  packageIds: string[];
  estimatedDelivery: string; // ISO date string
  originLocationId?: number | null; // Pickup: origin location, Transfer/LastMile: null
  destinationLocationId?: number | null; // Transfer: destination location, Pickup/LastMile: null
  type?: ShipmentType | null; // Explicit shipment type
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
