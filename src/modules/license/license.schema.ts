import { t } from 'elysia';

// ข้อมูลที่ Client (Software ของคุณ) ต้องส่งมา
export const ActivateLicenseSchema = t.Object({
  licenseKey: t.String({
    minLength: 10,
    error: 'License key is required and must be valid.',
  }),
  hardwareId: t.String({
    minLength: 8,
    error: 'Hardware ID is required.',
  }),
  productId: t.String({ // ID ของ Software ที่คุณกำหนดเอง
    minLength: 3,
    error: 'Product ID is required.',
  }),
  customerEmail: t.Optional(t.String({ format: 'email' })),
  customerName: t.Optional(t.String()),
});

