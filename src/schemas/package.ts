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
});

export type CreatePackageSchema = z.infer<typeof createPackageSchema>;
export default createPackageSchema;
