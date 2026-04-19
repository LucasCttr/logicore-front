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

// Helper to get user role from JWT token
function getUserRoleFromToken(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    const roles = payload.roles || payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    if (!roles) return null;
    if (Array.isArray(roles)) return roles[0];
    return String(roles).split(',')[0].trim();
  } catch (e) {
    return null;
  }
}

export function useShipments(page = 1, pageSize = 10, filters?: Record<string, any>) {
  const { sortBy, sortDir, status, q } = filters ?? {};
  const userRole = getUserRoleFromToken();
  
  // Drivers use /api/shipments/me, admins use /api/shipments
  if (userRole === 'Driver') {
    return useQuery<PagedResultDto<Shipment>, Error>({
      queryKey: ['shipments', 'driver', 'me'],
      queryFn: async () => {
        const driverShipments = await getMyShipments();
        // getMyShipments already normalizes data, just wrap in PagedResultDto for consistency
        return {
          items: driverShipments,
          total: driverShipments.length,
          page: 1,
          pageSize: driverShipments.length,
        };
      },
    });
  }
  
  // Admin endpoint
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
