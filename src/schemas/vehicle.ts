import { z } from 'zod';

const createVehicleSchema = z.object({
  plate: z.string().min(1, 'License plate is required').min(3, 'License plate must be at least 3 characters'),
  maxWeightCapacity: z.number().min(1, 'Maximum weight capacity is required').gt(0, 'Must be greater than 0'),
  maxVolumeCapacity: z.number().min(1, 'Maximum volume capacity is required').gt(0, 'Must be greater than 0'),
});

export type CreateVehicleSchema = z.infer<typeof createVehicleSchema>;
export default createVehicleSchema;
