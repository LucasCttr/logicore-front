import { z } from 'zod';

export const editPackageSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  internalCode: z.string().min(1, 'Internal code is required').max(100, 'Internal code max 100 characters'),
  weight: z.coerce.number().positive('Weight must be positive'),
  recipientName: z.string().min(1, 'Recipient name is required'),
  recipientAddress: z.string().min(1, 'Recipient address is required'),
  recipientPhone: z.string().min(1, 'Recipient phone is required'),
  recipientFloorApartment: z.string().min(1, 'Floor/Apartment is required'),
  recipientCity: z.string().min(1, 'City is required'),
  recipientProvince: z.string().min(1, 'Province is required'),
  recipientPostalCode: z.string().min(1, 'Postal code is required'),
  recipientDni: z.string().min(1, 'DNI is required'),
  lengthCm: z.coerce.number().positive('Length must be positive'),
  widthCm: z.coerce.number().positive('Width must be positive'),
  heightCm: z.coerce.number().positive('Height must be positive'),
});

export type EditPackageSchema = z.infer<typeof editPackageSchema>;
