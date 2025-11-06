import { t } from 'elysia';

export const CreateLicenseSchema = t.Object({
  licenseKey: t.String({ minLength: 10, error: 'License key is required.' }),
  productId: t.String({ minLength: 3, error: 'Product ID is required.' }),
  notes: t.Optional(t.String()),
});

export const UpdateLicenseSchema = t.Object({
  status: t.Optional(t.Union([
    t.Literal('available'),
    t.Literal('activated'),
    t.Literal('expired'),
    t.Literal('revoked'),
  ])),
  enabled: t.Optional(t.Boolean()),
  notes: t.Optional(t.String()),
});

