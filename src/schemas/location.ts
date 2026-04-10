import { z } from 'zod';

export const createLocationSchema = z.object({
  name: z.string().min(1, { message: 'Location name is required' }),
  addressLine1: z.string().min(1, { message: 'Address is required' }),
  addressLine2: z.string().optional(),
  city: z.string().min(1, { message: 'City is required' }),
  state: z.string().optional(),
  postalCode: z.string().min(1, { message: 'Postal code is required' }),
  country: z.string().min(1, { message: 'Country is required' }),
});

export type CreateLocationSchema = z.infer<typeof createLocationSchema>;

export default createLocationSchema;
