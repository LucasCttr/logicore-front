import { z } from 'zod';

export const registerDriverSchema = z.object({
  name: z.string().min(1, { message: 'El nombre es requerido' }),
  phone: z.string().optional().nullable(),
});

export type RegisterDriverSchema = z.infer<typeof registerDriverSchema>;

export default registerDriverSchema;
