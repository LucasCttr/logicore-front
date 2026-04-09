import { useQuery } from '@tanstack/react-query';
import { getDrivers } from '../api/drivers';
import type { Driver } from '../types/drivers';

export interface DriversResponse {
  items: Driver[];
}

export function useDrivers() {
  return useQuery<DriversResponse, Error>({
    queryKey: ['drivers'],
    queryFn: async () => {
      const drivers = await getDrivers();
      return { items: Array.isArray(drivers) ? drivers : [] };
    },
    staleTime: 1000 * 60,
  });
}
