import type { Shipment } from '../types/shipments';

type BackendShipmentLike = {
  id?: string;
  routeCode?: string | null;
  vehicleId?: string | null;
  driverId?: string | null;
  createdAt?: string | null;
  estimatedDelivery?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  arrivedAt?: string | null;
  vehicleMaxWeightCapacity?: number | { parsedValue?: number } | null;
  vehicleMaxVolumeCapacity?: number | { parsedValue?: number } | null;
  packageIds?: string[] | null;
  destinationLocationId?: number | null;
  destinationLocationName?: string | null;
  originLocationName?: string | null;
  origin?: string | null;
  destination?: string | null;
  status?: unknown;
};

/** Matches `LogiCore.Domain.Entities.ShipmentStatus` (int or JSON string enum). */
const SHIPMENT_STATUS_BY_NAME: Record<string, number> = {
  draft: 0,
  loading: 1,
  dispatched: 2,
  arrived: 3,
  canceled: 4,
  cancelled: 4,
  delivered: 5,
};

/**
 * Coerces API `status` to numeric enum value. Backend may send int or string ("Delivered").
 */
export function parseShipmentStatus(value: unknown): number {
  if (value === null || value === undefined) return -1;
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string') {
    const v = value.trim();
    if (v === '') return -1;
    if (/^-?\d+$/.test(v)) return parseInt(v, 10);
    const mapped = SHIPMENT_STATUS_BY_NAME[v.toLowerCase()];
    if (mapped !== undefined) return mapped;
  }
  return -1;
}

/**
 * Normalizes backend shipment response to frontend format
 * Handles property naming differences and adds missing fields
 */
export function normalizeShipment(backendShipment: BackendShipmentLike): Shipment {
  return {
    id: backendShipment.id ?? '',
    routeCode: backendShipment.routeCode ?? null,
    vehicleId: backendShipment.vehicleId ?? null,
    driverId: backendShipment.driverId ?? null,
    createdAt: backendShipment.createdAt ?? null,
    estimatedDelivery: backendShipment.estimatedDelivery ?? null,
    shippedAt: backendShipment.shippedAt ?? null,
    deliveredAt: backendShipment.deliveredAt ?? null,
    arrivedAt: backendShipment.arrivedAt ?? null,
    vehicleMaxWeightCapacity: typeof backendShipment.vehicleMaxWeightCapacity === 'object'
      ? backendShipment.vehicleMaxWeightCapacity?.parsedValue ?? null
      : backendShipment.vehicleMaxWeightCapacity ?? null,
    vehicleMaxVolumeCapacity: typeof backendShipment.vehicleMaxVolumeCapacity === 'object'
      ? backendShipment.vehicleMaxVolumeCapacity?.parsedValue ?? null
      : backendShipment.vehicleMaxVolumeCapacity ?? null,
    packageIds: backendShipment.packageIds ?? null,
    destinationLocationId: backendShipment.destinationLocationId ?? null,
    status: parseShipmentStatus(backendShipment.status),
    origin: backendShipment.originLocationName ?? backendShipment.origin ?? null,
    destination: backendShipment.destinationLocationName ?? backendShipment.destination ?? null,
  };
}

export function normalizeShipments(backendShipments: BackendShipmentLike[]): Shipment[] {
  return backendShipments.map(normalizeShipment);
}
