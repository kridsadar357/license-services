import { db } from '../../db';
import { products } from '../../db/schema';
import { eq, like, and, or } from 'drizzle-orm';

export async function createProduct(data: {
  name: string;
  description?: string;
  productId: string;
}) {
  const existing = await db.query.products.findFirst({
    where: eq(products.productId, data.productId),
  });

  if (existing) {
    throw new Error('Product ID already exists.');
  }

  await db.insert(products).values({
    name: data.name,
    description: data.description || null,
    productId: data.productId,
    enabled: true,
  });

  return await db.query.products.findFirst({
    where: eq(products.productId, data.productId),
  });
}

export async function getProducts(search?: string) {
  if (search) {
    return await db.query.products.findMany({
      where: or(
        like(products.name, `%${search}%`),
        like(products.productId, `%${search}%`),
        like(products.description || '', `%${search}%`)
      ),
      orderBy: (products, { desc }) => [desc(products.createdAt)],
    });
  }

  return await db.query.products.findMany({
    orderBy: (products, { desc }) => [desc(products.createdAt)],
  });
}

export async function getProductById(id: number) {
  const product = await db.query.products.findFirst({
    where: eq(products.id, id),
  });
  
  if (!product) return null;
  
  const productLicenses = await db.query.licenses.findMany({
    where: eq(licenses.productId, product.productId),
  });
  
  return { ...product, licenses: productLicenses };
}

export async function getProductByProductId(productId: string) {
  const product = await db.query.products.findFirst({
    where: eq(products.productId, productId),
  });
  
  if (!product) return null;
  
  const productLicenses = await db.query.licenses.findMany({
    where: eq(licenses.productId, product.productId),
  });
  
  return { ...product, licenses: productLicenses };
}

export async function updateProduct(id: number, data: {
  name?: string;
  description?: string;
  enabled?: boolean;
}) {
  await db.update(products)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(products.id, id));

  return await db.query.products.findFirst({
    where: eq(products.id, id),
  });
}

export async function deleteProduct(id: number) {
  // Check if product has licenses
  const product = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      licenses: true,
    },
  });

  if (product && product.licenses.length > 0) {
    throw new Error('Cannot delete product with existing licenses. Please delete or reassign licenses first.');
  }

  await db.delete(products).where(eq(products.id, id));
  return { success: true };
}

