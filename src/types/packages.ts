export type Package = {
  id: string;
  trackingNumber?: string | null;
  description?: string | null;
  weight?: number | null;
  status?: string | null;
  origin?: string | null;
  destination?: string | null;
  shipmentId?: string | null;
  createdAt?: string | null;
  [key: string]: any;
};

export type CreatePackageDto = {
  trackingNumber?: string;
  description?: string;
  weight?: number;
  origin?: string;
  destination?: string;
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
