import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVehicles, createVehicle, type Vehicle, type CreateVehicleRequest } from '../api/vehicles';

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

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVehicleRequest) => createVehicle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}
