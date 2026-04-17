import type { Shipment } from '../types/shipments';

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
    status: backendShipment.status,
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
