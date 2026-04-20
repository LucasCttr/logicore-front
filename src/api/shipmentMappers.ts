import type { Shipment } from '../types/shipments';

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
export function normalizeShipment(backendShipment: any): Shipment {
  return {
    id: backendShipment.id,
    routeCode: backendShipment.routeCode,
    vehicleId: backendShipment.vehicleId,
    driverId: backendShipment.driverId,
    createdAt: backendShipment.createdAt,
    estimatedDelivery: backendShipment.estimatedDelivery,
    shippedAt: backendShipment.shippedAt,
    deliveredAt: backendShipment.deliveredAt,
    arrivedAt: backendShipment.arrivedAt,
    vehicleMaxWeightCapacity: backendShipment.vehicleMaxWeightCapacity?.parsedValue ?? 
                              backendShipment.vehicleMaxWeightCapacity,
    vehicleMaxVolumeCapacity: backendShipment.vehicleMaxVolumeCapacity?.parsedValue ?? 
                              backendShipment.vehicleMaxVolumeCapacity,
    packageIds: backendShipment.packageIds,
    destinationLocationId: backendShipment.destinationLocationId,
    status: parseShipmentStatus(backendShipment.status),
    // Additional computed fields for frontend
    ...(backendShipment.destinationLocationId && {
      destination: 'Loading destination...'
    }),
    origin: 'Depot', // For first-time transport to depot
  };
}

export function normalizeShipments(backendShipments: any[]): Shipment[] {
  return backendShipments.map(normalizeShipment);
}
