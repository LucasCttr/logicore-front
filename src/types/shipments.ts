export type Shipment = {
  id: string;
  reference?: string | null;
  status?: string | null;
  driverId?: string | null;
  createdAt?: string | null;
  [key: string]: any;
};

export type CreateShipmentDto = {
  reference?: string;
  // other fields as needed
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
