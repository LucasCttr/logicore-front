export type Driver = {
  id: string;
  name: string;
  phone: string;
  licenseNumber?: string | null;
  isActive?: boolean | null;
  applicationUserId?: string | null;
  [key: string]: any;
};

export type RegisterDriverDto = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  licenseNumber: string;
  phone: string;
};

export type UpdateDriverStatusDto = {
  isActive: boolean;
};

export default Driver;
