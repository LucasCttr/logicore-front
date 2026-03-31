import { useQuery } from '@tanstack/react-query';
import { getDrivers } from '../api/drivers';
import type { Driver } from '../types/drivers';

export function useDrivers() {
  return useQuery<Driver[], Error>({
    queryKey: ['drivers'],
    queryFn: () => getDrivers(),
    staleTime: 1000 * 60,
  });
}
