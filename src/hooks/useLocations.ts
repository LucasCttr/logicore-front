import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { LocationDto, CreateLocationDto } from '../types/locations';
import { getLocations, createLocation } from '../api/locations';

export function useLocations() {
  return useQuery<LocationDto[], Error>({
    queryKey: ['locations'],
    queryFn: () => getLocations(),
    staleTime: 1000 * 60,
  });
}

export function useCreateLocation() {
  const qc = useQueryClient();
  return useMutation<LocationDto, Error, CreateLocationDto>({
    mutationFn: (data) => createLocation(data),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}
