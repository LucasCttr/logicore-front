import { z } from 'zod';

const createShipmentSchema = z.object({
  driverId: z.string().min(1, 'Driver is required'),
  vehicleId: z.string().min(1, 'Vehicle is required'),
  estimatedDelivery: z.string().min(1, 'Estimated delivery is required'),
  destinationLocationId: z.string().optional().nullable(),
});

export type CreateShipmentSchema = z.infer<typeof createShipmentSchema>;
export default createShipmentSchema;
