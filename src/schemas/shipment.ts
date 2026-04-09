import { z } from 'zod';

const createShipmentSchema = z.object({
  driverId: z.string().min(1, 'Driver is required').uuid('Driver must be a valid UUID'),
  vehicleId: z.string().min(1, 'Vehicle is required').uuid('Vehicle must be a valid UUID'),
  packageIds: z.array(z.string().uuid()).min(1, 'At least one package must be selected'),
  estimatedDelivery: z.string().min(1, 'Estimated delivery is required').datetime('Invalid date format').refine(
    (date) => new Date(date) > new Date(),
    'Estimated delivery must be in the future'
  ),
  shipmentType: z.enum(['depot-to-depot', 'last-mile']).default('last-mile'),
  destinationLocationId: z.string().optional(),
});

export type CreateShipmentSchema = z.infer<typeof createShipmentSchema>;
export default createShipmentSchema;
