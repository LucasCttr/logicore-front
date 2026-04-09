import { z } from 'zod';

const createPackageSchema = z.object({
  trackingNumber: z.string().min(1, 'Tracking number is required'),
  description: z.string().min(1, 'Description is required'),
  internalCode: z.string().min(1, 'Internal code is required').max(100, 'Internal code max 100 characters'),
  weight: z.preprocess((v) => {
    if (v === '' || v === null || v === undefined) return undefined;
    const n = Number(v);
    return Number.isNaN(n) ? v : n;
  }, z.number().positive('Weight must be positive')),
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  // Recipient fields
  recipientName: z.string().min(1, 'Recipient name is required'),
  recipientAddress: z.string().min(1, 'Recipient address is required'),
  recipientPhone: z.string().min(1, 'Recipient phone is required'),
  recipientFloorApartment: z.string().min(1, 'Floor/Apartment is required'),
  recipientCity: z.string().min(1, 'City is required'),
  recipientProvince: z.string().min(1, 'Province is required'),
  recipientPostalCode: z.string().min(1, 'Postal code is required'),
  recipientDni: z.string().min(1, 'DNI is required'),

  // Dimensions
  lengthCm: z.preprocess((v) => {
    if (v === '' || v === null || v === undefined) return undefined;
    const n = Number(v);
    return Number.isNaN(n) ? v : n;
  }, z.number().positive('Length must be positive')),
  widthCm: z.preprocess((v) => {
    if (v === '' || v === null || v === undefined) return undefined;
    const n = Number(v);
    return Number.isNaN(n) ? v : n;
  }, z.number().positive('Width must be positive')),
  heightCm: z.preprocess((v) => {
    if (v === '' || v === null || v === undefined) return undefined;
    const n = Number(v);
    return Number.isNaN(n) ? v : n;
  }, z.number().positive('Height must be positive')),
});

export type CreatePackageSchema = z.infer<typeof createPackageSchema>;
export default createPackageSchema;
