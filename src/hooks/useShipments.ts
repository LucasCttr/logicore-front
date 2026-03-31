import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Shipment, CreateShipmentDto, AssignDriverDto, PagedResultDto } from '../types/shipments';
import {
  createShipment,
  getShipments,
  getShipmentById,
  getMyShipments,
  addPackageToShipment,
  dispatchShipment,
  assignDriver,
  arriveShipment,
  completeShipment,
  cancelShipment,
} from '../api/shipments';

export function useShipments(page = 1, pageSize = 10, filters?: Record<string, any>) {
  const { sortBy, sortDir, status, q } = filters ?? {};
  return useQuery<PagedResultDto<Shipment>, Error>({
    queryKey: ['shipments', { page, pageSize, sortBy, sortDir, status, q }],
    queryFn: () => getShipments(page, pageSize, sortBy, sortDir, status, q),
  });
}

export function useMyShipments() {
  return useQuery<Shipment[], Error>({
    queryKey: ['shipments', 'me'],
    queryFn: () => getMyShipments(),
  });
}

export function useShipment(id: string) {
  return useQuery<Shipment, Error>({
    queryKey: ['shipment', id],
    queryFn: () => getShipmentById(id),
  });
}

export function useCreateShipment() {
  const qc = useQueryClient();
  return useMutation<Shipment, Error, CreateShipmentDto>({
    mutationFn: (data) => createShipment(data),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ['shipments'] });
    },
  });
}

export function useAddPackageToShipment() {
  const qc = useQueryClient();
  return useMutation<Shipment, Error, { id: string; packageId: string }>({
    mutationFn: ({ id, packageId }) => addPackageToShipment(id, { packageId }),
    onSuccess(_, vars) {
      qc.invalidateQueries({ queryKey: ['shipments'] });
      qc.invalidateQueries({ queryKey: ['shipment', (vars as any).id] });
    },
  });
}

export function useDispatchShipment() {
  const qc = useQueryClient();
  return useMutation<boolean, Error, string>({
    mutationFn: (id) => dispatchShipment(id),
    onSuccess(_, id) {
      qc.invalidateQueries({ queryKey: ['shipments'] });
      qc.invalidateQueries({ queryKey: ['shipment', id] });
    },
  });
}

export function useAssignDriver() {
  const qc = useQueryClient();
  return useMutation<boolean, Error, { id: string; payload: AssignDriverDto }>({
    mutationFn: ({ id, payload }) => assignDriver(id, payload),
    onSuccess(_, vars) {
      qc.invalidateQueries({ queryKey: ['shipments'] });
      qc.invalidateQueries({ queryKey: ['shipment', (vars as any).id] });
    },
  });
}

export function useArriveShipment() {
  const qc = useQueryClient();
  return useMutation<boolean, Error, string>({
    mutationFn: (id) => arriveShipment(id),
    onSuccess(_, id) {
      qc.invalidateQueries({ queryKey: ['shipments'] });
      qc.invalidateQueries({ queryKey: ['shipment', id] });
    },
  });
}

export function useCompleteShipment() {
  const qc = useQueryClient();
  return useMutation<boolean, Error, string>({
    mutationFn: (id) => completeShipment(id),
    onSuccess(_, id) {
      qc.invalidateQueries({ queryKey: ['shipments'] });
      qc.invalidateQueries({ queryKey: ['shipment', id] });
    },
  });
}

export function useCancelShipment() {
  const qc = useQueryClient();
  return useMutation<boolean, Error, string>({
    mutationFn: (id) => cancelShipment(id),
    onSuccess(_, id) {
      qc.invalidateQueries({ queryKey: ['shipments'] });
      qc.invalidateQueries({ queryKey: ['shipment', id] });
    },
  });
}
