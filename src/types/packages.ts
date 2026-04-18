export enum ShipmentType {
  Pickup = 0,
  Transfer = 1,
  LastMile = 2
}

export type CurrentShipment = {
  id: string;
  type: ShipmentType;
  destinationName?: string | null;
  destinationLocationId?: number | null;
};

export type Package = {
  id: string;
  trackingNumber?: string | null;
  description?: string | null;
  weight?: number | null;
  status?: number | string | null;
  origin?: string | null;
  destination?: string | null;
  shipmentId?: string | null;
  createdAt?: string | null;
  lastUpdatedAt?: string | null;
  priority?: number | string | null;
  originAddress?: string | null;
  destinationAddress?: string | null;
  currentShipment?: CurrentShipment | null;
  [key: string]: any;
};

export type CreatePackageDto = {
  trackingNumber?: string; // Auto-generated on backend if not provided
  description: string;
  internalCode: string;
  weight: number;
  priority: number; // 0 = Standard, 1 = Express, 2 = Economic
  origin: string;
  destination: string;

  // Recipient fields
  recipientName: string;
  recipientAddress: string;
  recipientPhone: string;
  recipientFloorApartment: string;
  recipientCity: string;
  recipientProvince: string;
  recipientPostalCode: string;
  recipientDni: string;

  // Dimensions (cm)
  lengthCm: number;
  widthCm: number;
  heightCm: number;
};


export type UpdatePackageDto = Partial<CreatePackageDto> & {
  id?: string;
};

export type PackagePublicHistoryDto = {
  trackingNumber: string;
  events: { at: string; message: string }[];
};

export type PackageInternalHistoryDto = {
  at: string;
  status: string;
  note?: string | null;
};

export default Package;

export type PagedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
