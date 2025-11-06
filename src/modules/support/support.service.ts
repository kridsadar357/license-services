import { db } from '../../db';
import { licenses, activations, products } from '../../db/schema';
import { eq, like, or, and } from 'drizzle-orm';

export async function searchByLicenseKey(licenseKey: string) {
  const license = await db.query.licenses.findFirst({
    where: eq(licenses.licenseKey, licenseKey),
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

export async function searchByActivationToken(activationToken: string) {
  const activation = await db.query.activations.findFirst({
    where: eq(activations.activationToken, activationToken),
  });
  
  if (!activation) return null;
  
  const license = await db.query.licenses.findFirst({
    where: eq(licenses.id, activation.licenseId),
  });
  
  if (!license) return activation;
  
  const product = await db.query.products.findFirst({
    where: eq(products.productId, license.productId),
  });
  
  return { ...activation, license: { ...license, product } };
}

export async function searchByCustomerEmail(email: string) {
  const customerActivations = await db.query.activations.findMany({
    where: eq(activations.customerEmail, email),
  });
  
  return await Promise.all(
    customerActivations.map(async (activation) => {
      const license = await db.query.licenses.findFirst({
        where: eq(licenses.id, activation.licenseId),
      });
      
      if (!license) return activation;
      
      const product = await db.query.products.findFirst({
        where: eq(products.productId, license.productId),
      });
      
      return { ...activation, license: { ...license, product } };
    })
  );
}

export async function searchByCustomerName(name: string) {
  const allActivations = await db.query.activations.findMany();
  const customerActivations = allActivations.filter(
    act => act.customerName && act.customerName.toLowerCase().includes(name.toLowerCase())
  );
  
  return await Promise.all(
    customerActivations.map(async (activation) => {
      const license = await db.query.licenses.findFirst({
        where: eq(licenses.id, activation.licenseId),
      });
      
      if (!license) return activation;
      
      const product = await db.query.products.findFirst({
        where: eq(products.productId, license.productId),
      });
      
      return { ...activation, license: { ...license, product } };
    })
  );
}

export async function searchByProductId(productId: string) {
  const product = await db.query.products.findFirst({
    where: eq(products.productId, productId),
  });
  
  if (!product) return null;
  
  const productLicenses = await db.query.licenses.findMany({
    where: eq(licenses.productId, product.productId),
  });
  
  const licensesWithActivations = await Promise.all(
    productLicenses.map(async (license) => {
      const activations = await db.query.activations.findMany({
        where: eq(activations.licenseId, license.id),
      });
      return { ...license, activations };
    })
  );
  
  return { ...product, licenses: licensesWithActivations };
}

export async function getLicenseStats() {
  const allLicenses = await db.query.licenses.findMany();
  const allActivations = await db.query.activations.findMany();

  const stats = {
    total: allLicenses.length,
    available: allLicenses.filter(l => l.status === 'available').length,
    activated: allLicenses.filter(l => l.status === 'activated').length,
    expired: allLicenses.filter(l => l.status === 'expired').length,
    revoked: allLicenses.filter(l => l.status === 'revoked').length,
    totalActivations: allActivations.length,
  };

  return stats;
}

