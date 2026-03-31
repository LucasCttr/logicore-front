export type Driver = {
  id: string;
  name: string;
  phone?: string | null;
  status?: string | null;
  applicationUserId?: string | null;
  [key: string]: any;
};

export type RegisterDriverDto = {
  name: string;
  phone?: string;
  // extend with other fields if needed
};

export type UpdateDriverStatusDto = {
  status: string;
};

export default Driver;
