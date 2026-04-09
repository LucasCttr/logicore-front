import { useQuery } from '@tanstack/react-query';
import { getVehicles } from '../api/vehicles';
import type { Vehicle } from '../api/vehicles';

export interface VehiclesResponse {
  items: Vehicle[];
}

export function useVehicles() {
  return useQuery<VehiclesResponse, Error>({
    queryKey: ['vehicles'],
    queryFn: () => getVehicles(),
    staleTime: 1000 * 60,
  });
}
