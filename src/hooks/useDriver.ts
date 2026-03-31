import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getDriverById,
  getAvailableDrivers,
  getMyDriverProfile,
  registerDriver,
  updateDriverStatus,
} from '../api/drivers';
import type { Driver, RegisterDriverDto, UpdateDriverStatusDto } from '../types/drivers';

export function useDriver(id: string) {
  return useQuery<Driver, Error>({
    queryKey: ['driver', id],
    queryFn: () => getDriverById(id),
  });
}

export function useAvailableDrivers() {
  return useQuery<Driver[], Error>({
    queryKey: ['drivers', 'available'],
    queryFn: () => getAvailableDrivers(),
  });
}

export function useMyDriver() {
  return useQuery<Driver, Error>({
    queryKey: ['drivers', 'me'],
    queryFn: () => getMyDriverProfile(),
  });
}

export function useRegisterDriver() {
  const qc = useQueryClient();
  return useMutation<Driver, Error, RegisterDriverDto>({
    mutationFn: (data) => registerDriver(data),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}

export function useUpdateDriverStatus() {
  const qc = useQueryClient();
  return useMutation<Driver, Error, { id: string; payload: UpdateDriverStatusDto }>({
    mutationFn: ({ id, payload }) => updateDriverStatus(id, payload),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ['drivers'] });
      // invalidate any driver detail queries (['driver', id])
      qc.invalidateQueries({ predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === 'driver' });
    },
  });
}
