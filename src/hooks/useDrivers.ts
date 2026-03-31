import { useQuery } from '@tanstack/react-query';
import { getDrivers, Driver } from '../api/drivers';

export function useDrivers() {
  return useQuery<Driver[], Error>({
    queryKey: ['drivers'],
    queryFn: () => getDrivers(),
    staleTime: 1000 * 60,
  });
}
