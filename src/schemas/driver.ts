import { z } from 'zod';

export const registerDriverSchema = z.object({
  firstName: z.string().min(1, { message: 'Name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  email: z.string().email({ message: 'Invalid email' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  licenseNumber: z.string().min(1, { message: 'License number is required' }),
  phone: z.string().min(1, { message: 'Phone is required' }),
});

export type RegisterDriverSchema = z.infer<typeof registerDriverSchema>;

export default registerDriverSchema;
