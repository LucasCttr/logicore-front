import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Package, CreatePackageDto, UpdatePackageDto, PackageInternalHistoryDto, PagedResponse } from '../types/packages';
import {
  getPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deliverPackage,
  cancelPackage,
  getPackageByTracking,
  getPackageHistory,
} from '../api/packages';

export function usePackages(page = 1, pageSize = 20) {
  return useQuery<PagedResponse<Package>, Error>({
    queryKey: ['packages', { page, pageSize }],
    queryFn: () => getPackages(page, pageSize),
  });
}

export function usePackage(id: string) {
  return useQuery<Package, Error>({
    queryKey: ['package', id],
    queryFn: () => getPackageById(id),
  });
}

export function useCreatePackage() {
  const qc = useQueryClient();
  return useMutation<Package, Error, CreatePackageDto>({
    mutationFn: (data) => createPackage(data),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ['packages'] });
    },
  });
}

export function useUpdatePackage() {
  const qc = useQueryClient();
  return useMutation<Package, Error, { id: string; payload: UpdatePackageDto }>({
    mutationFn: ({ id, payload }) => updatePackage(id, payload),
    onSuccess(_, _vars) {
      qc.invalidateQueries({ queryKey: ['packages'] });
      qc.invalidateQueries({ queryKey: ['package', (_vars as any).id] });
    },
  });
}

export function useDeliverPackage() {
  const qc = useQueryClient();
  return useMutation<Package, Error, string>({
    mutationFn: (id) => deliverPackage(id),
    onSuccess(_, id) {
      qc.invalidateQueries({ queryKey: ['packages'] });
      qc.invalidateQueries({ queryKey: ['package', id] });
    },
  });
}

export function useCancelPackage() {
  const qc = useQueryClient();
  return useMutation<Package, Error, string>({
    mutationFn: (id) => cancelPackage(id),
    onSuccess(_, id) {
      qc.invalidateQueries({ queryKey: ['packages'] });
      qc.invalidateQueries({ queryKey: ['package', id] });
    },
  });
}

export function usePackageByTracking(tracking: string) {
  return useQuery<any, Error>({
    queryKey: ['packages', 'tracking', tracking],
    queryFn: () => getPackageByTracking(tracking),
  });
}

export function usePackageHistory(id: string) {
  return useQuery<PackageInternalHistoryDto[], Error>({
    queryKey: ['package', id, 'history'],
    queryFn: () => getPackageHistory(id),
  });
}
