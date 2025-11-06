import { t } from 'elysia';

export const CreateProductSchema = t.Object({
  name: t.String({ minLength: 1, error: 'Product name is required.' }),
  description: t.Optional(t.String()),
  productId: t.String({ minLength: 3, error: 'Product ID must be at least 3 characters.' }),
});

export const UpdateProductSchema = t.Object({
  name: t.Optional(t.String({ minLength: 1 })),
  description: t.Optional(t.String()),
  enabled: t.Optional(t.Boolean()),
});

