export type LocationDto = {
  id: string;
  name: string;
  address?: string | null;
  [key: string]: any;
};

export type CreateLocationDto = {
  name: string;
  address?: string;
};

export default LocationDto;
