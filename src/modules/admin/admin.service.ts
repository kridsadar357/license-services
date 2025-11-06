import { db } from '../../db';
import { licenses, products, activations } from '../../db/schema';
import { eq, like, and, or, desc, sql } from 'drizzle-orm';

export async function createLicense(data: {
  licenseKey: string;
  productId: string;
  notes?: string;
}) {
  // Verify product exists
  const product = await db.query.products.findFirst({
    where: eq(products.productId, data.productId),
  });

  if (!product) {
    throw new Error('Product not found.');
  }

  const existing = await db.query.licenses.findFirst({
    where: eq(licenses.licenseKey, data.licenseKey),
  });

  if (existing) {
    throw new Error('License key already exists.');
  }

  await db.insert(licenses).values({
    licenseKey: data.licenseKey,
    productId: data.productId,
    notes: data.notes || null,
    status: 'available',
    enabled: true,
  });

  const createdLicense = await db.query.licenses.findFirst({
    where: eq(licenses.licenseKey, data.licenseKey),
  });
  
  if (!createdLicense) return null;
  
  const licenseProduct = await db.query.products.findFirst({
    where: eq(products.productId, createdLicense.productId),
  });
  
  const licenseActivations = await db.query.activations.findMany({
    where: eq(activations.licenseId, createdLicense.id),
  });
  
  return { ...createdLicense, product: licenseProduct, activations: licenseActivations };
}

export async function getLicenses(search?: string, productId?: string, status?: string) {
  try {
    const conditions = [];
    
    if (search) {
      // Search in licenseKey or notes (handle null notes with COALESCE)
      conditions.push(
        or(
          like(licenses.licenseKey, `%${search}%`),
          sql`COALESCE(${licenses.notes}, '') LIKE ${`%${search}%`}`
        )
      );
    }
    
    if (productId) {
      conditions.push(eq(licenses.productId, productId));
    }
    
    if (status) {
      conditions.push(eq(licenses.status, status as any));
    }

    const licenseList = await db.query.licenses.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(licenses.createdAt)],
    });
    
    // Fetch related data
    const licensesWithRelations = await Promise.all(
      licenseList.map(async (license) => {
        try {
          const product = await db.query.products.findFirst({
            where: eq(products.productId, license.productId),
          });
          
          const licenseActivations = await db.query.activations.findMany({
            where: eq(activations.licenseId, license.id),
          });
          
          return { ...license, product: product || null, activations: licenseActivations || [] };
        } catch (err) {
          console.error(`Error fetching relations for license ${license.id}:`, err);
          return { ...license, product: null, activations: [] };
        }
      })
    );
    
    return licensesWithRelations;
  } catch (error) {
    console.error('Error in getLicenses:', error);
    throw error;
  }
}

export async function getLicenseById(id: number) {
  const license = await db.query.licenses.findFirst({
    where: eq(licenses.id, id),
  });
  
  if (!license) return null;
  
  const product = await db.query.products.findFirst({
    where: eq(products.productId, license.productId),
  });
  
  const licenseActivations = await db.query.activations.findMany({
    where: eq(activations.licenseId, license.id),
  });
  
  return { ...license, product, activations: licenseActivations };
}

export async function updateLicense(id: number, data: {
  status?: 'available' | 'activated' | 'expired' | 'revoked';
  enabled?: boolean;
  notes?: string;
}) {
  await db.update(licenses)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(licenses.id, id));

  const license = await db.query.licenses.findFirst({
    where: eq(licenses.id, id),
  });
  
  if (!license) return null;
  
  const product = await db.query.products.findFirst({
    where: eq(products.productId, license.productId),
  });
  
  const licenseActivations = await db.query.activations.findMany({
    where: eq(activations.licenseId, license.id),
  });
  
  return { ...license, product, activations: licenseActivations };
}

export async function deleteLicense(id: number) {
  // Check if license is activated
  const license = await db.query.licenses.findFirst({
    where: eq(licenses.id, id),
  });

  if (!license) {
    throw new Error('License not found.');
  }

  const licenseActivations = await db.query.activations.findMany({
    where: eq(activations.licenseId, license.id),
  });

  if (licenseActivations.length > 0) {
    throw new Error('Cannot delete license with activations. Please revoke it instead.');
  }

  await db.delete(licenses).where(eq(licenses.id, id));
  return { success: true };
}

export async function toggleLicenseEnabled(id: number, enabled: boolean) {
  await db.update(licenses)
    .set({ enabled, updatedAt: new Date() })
    .where(eq(licenses.id, id));

  const license = await db.query.licenses.findFirst({
    where: eq(licenses.id, id),
  });
  
  if (!license) return null;
  
  const product = await db.query.products.findFirst({
    where: eq(products.productId, license.productId),
  });
  
  const licenseActivations = await db.query.activations.findMany({
    where: eq(activations.licenseId, license.id),
  });
  
  return { ...license, product, activations: licenseActivations };
}

