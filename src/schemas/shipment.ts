import { z } from 'zod';

const createShipmentSchema = z.object({
  driverId: z.string().uuid('Driver is required'),
  vehicleId: z.string().uuid('Vehicle is required'),
  packageIds: z.array(z.string().uuid()).min(1, 'At least one package must be selected'),
  estimatedDelivery: z.string().datetime('Invalid date format').refine(
    (date) => new Date(date) > new Date(),
    'Estimated delivery must be in the future'
  ),
});

export type CreateShipmentSchema = z.infer<typeof createShipmentSchema>;
export default createShipmentSchema;
