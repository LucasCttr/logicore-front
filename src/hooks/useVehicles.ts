import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVehicles, createVehicle, updateVehicle, type Vehicle, type CreateVehicleRequest, type UpdateVehicleRequest } from '../api/vehicles';

export interface VehiclesResponse {
  items: Vehicle[];
}

export function useVehicles() {
  return useQuery<VehiclesResponse, Error>({
    queryKey: ['vehicles'],
    queryFn: async () => ({ items: await getVehicles() }),
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

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateVehicleRequest }) => updateVehicle(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}
