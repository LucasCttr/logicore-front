import { z } from 'zod';

export const registerDriverSchema = z.object({
  firstName: z.string().min(1, { message: 'El nombre es requerido' }),
  lastName: z.string().min(1, { message: 'El apellido es requerido' }),
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
  licenseNumber: z.string().min(1, { message: 'El número de licencia es requerido' }),
  phone: z.string().optional().nullable(),
});

export type RegisterDriverSchema = z.infer<typeof registerDriverSchema>;

export default registerDriverSchema;
