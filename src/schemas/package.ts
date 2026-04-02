import { z } from 'zod';

const createPackageSchema = z.object({
  trackingNumber: z.string().min(1, 'Tracking number is required'),
  description: z.string().optional().nullable(),
  weight: z.preprocess((v) => {
    if (v === '' || v === null || v === undefined) return undefined;
    const n = Number(v);
    return Number.isNaN(n) ? v : n;
  }, z.number().positive().optional()),
  origin: z.string().optional().nullable(),
  destination: z.string().optional().nullable(),
  // Recipient fields
  recipientName: z.string().optional().nullable(),
  recipientAddress: z.string().optional().nullable(),
  recipientPhone: z.string().optional().nullable(),
  recipientFloorApartment: z.string().optional().nullable(),
  recipientCity: z.string().optional().nullable(),
  recipientProvince: z.string().optional().nullable(),
  recipientPostalCode: z.string().optional().nullable(),
  recipientDni: z.string().optional().nullable(),

  // Dimensions
  lengthCm: z.preprocess((v) => {
    if (v === '' || v === null || v === undefined) return undefined;
    const n = Number(v);
    return Number.isNaN(n) ? v : n;
  }, z.number().positive().optional()),
  widthCm: z.preprocess((v) => {
    if (v === '' || v === null || v === undefined) return undefined;
    const n = Number(v);
    return Number.isNaN(n) ? v : n;
  }, z.number().positive().optional()),
  heightCm: z.preprocess((v) => {
    if (v === '' || v === null || v === undefined) return undefined;
    const n = Number(v);
    return Number.isNaN(n) ? v : n;
  }, z.number().positive().optional()),
});

export type CreatePackageSchema = z.infer<typeof createPackageSchema>;
export default createPackageSchema;
