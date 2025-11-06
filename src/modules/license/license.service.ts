import { db } from '../../db';
import { licenses, activations, products } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { hash, compare } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// ฟังก์ชันสำหรับ Activate
export async function activateLicense(
  productId: string,
  licenseKey: string,
  hardwareId: string,
  customerEmail?: string,
  customerName?: string
) {
  // Trim and normalize inputs
  const normalizedProductId = productId.trim();
  const normalizedLicenseKey = licenseKey.trim();

  // 1. Check if product exists and is enabled first
  const product = await db.query.products.findFirst({
    where: eq(products.productId, normalizedProductId),
  });

  if (!product) {
    throw new Error(`Product ID "${normalizedProductId}" not found. Please check the product ID.`);
  }

  if (!product.enabled) {
    throw new Error('Product is disabled.');
  }

  // 2. ค้นหา License Key with the correct productId
  const foundLicense = await db.query.licenses.findFirst({
    where: and(
      eq(licenses.licenseKey, normalizedLicenseKey),
      eq(licenses.productId, normalizedProductId)
    ),
  });

  if (!foundLicense) {
    // Check if license key exists with different product
    const licenseWithDifferentProduct = await db.query.licenses.findFirst({
      where: eq(licenses.licenseKey, normalizedLicenseKey),
    });
    
    if (licenseWithDifferentProduct) {
      throw new Error(`License key found but belongs to product "${licenseWithDifferentProduct.productId}". You entered product "${normalizedProductId}". Please use the correct product ID.`);
    }
    
    throw new Error(`License key "${normalizedLicenseKey}" not found for product "${normalizedProductId}".`);
  }

  // 3. ตรวจสอบสถานะ
  if (foundLicense.status === 'activated') {
    // ถ้า Activate แล้ว ให้เช็ค HWID ว่าใช่เครื่องเดิมหรือไม่ (Re-activation)
    const existingActivation = await db.query.activations.findFirst({
      where: eq(activations.licenseId, foundLicense.id),
    });

    if (!existingActivation) {
      // ข้อมูลไม่ตรงกัน (แปลก)
      throw new Error('Activation record mismatch. Please contact support.');
    }

    // เปรียบเทียบ Hash ของ HWID
    const isSameHardware = await compare(hardwareId, existingActivation.hardwareIdHash);
    
    if (isSameHardware) {
      // ถ้าเป็นเครื่องเดิม ให้ส่ง Token เดิมกลับไป
      return { activationToken: existingActivation.activationToken };
    } else {
      // ถ้าเป็นเครื่องใหม่ (แต่ Key ถูกใช้ไปแล้ว)
      throw new Error('License key already activated on another device.');
    }
  }

  // 4. Check if license is enabled
  if (!foundLicense.enabled) {
    throw new Error('License key is disabled.');
  }

  // 5. ถ้าสถานะไม่ใช่ 'available' (เช่น ถูกยกเลิก, หมดอายุ)
  if (foundLicense.status !== 'available') {
    throw new Error(`License status is: ${foundLicense.status}.`);
  }

  // 6. (กรณี Activate ใหม่) ดำเนินการ Activate
  const hwidHash = await hash(hardwareId, 10); // Hash HWID (Security)
  const activationToken = uuidv4(); // สร้าง "Hash Key" ที่จะส่งกลับ

  // **สำคัญ: ใช้ Transaction** เพื่อให้แน่ใจว่าการ Update ทั้ง 2 ตารางสำเร็จพร้อมกัน
  try {
    await db.transaction(async (tx) => {
      // 4.1 Update สถานะ License
      await tx.update(licenses)
        .set({ status: 'activated' })
        .where(eq(licenses.id, foundLicense.id));

      // 4.2 สร้าง Activation record
      await tx.insert(activations).values({
        licenseId: foundLicense.id,
        hardwareIdHash: hwidHash,
        activationToken: activationToken,
        customerEmail: customerEmail || null,
        customerName: customerName || null,
      });
    });

    // ส่ง Token กลับไปให้ Software
    return { activationToken: activationToken };

  } catch (error) {
    console.error('Transaction failed:', error);
    throw new Error('Failed to activate license due to a server error.');
  }
}

// ฟังก์ชันสำหรับ Verify Activation Token
export async function verifyLicense(activationToken: string) {
  const activation = await db.query.activations.findFirst({
    where: eq(activations.activationToken, activationToken),
  });

  if (!activation) {
    throw new Error('Invalid activation token.');
  }

  // Get the associated license
  const license = await db.query.licenses.findFirst({
    where: eq(licenses.id, activation.licenseId),
  });

  if (!license) {
    throw new Error('License not found for activation token.');
  }

  // Check if license is still valid
  if (license.status === 'revoked' || license.status === 'expired') {
    throw new Error(`License status is: ${license.status}.`);
  }

  return {
    valid: true,
    productId: license.productId,
    status: license.status,
    activatedAt: activation.activatedAt,
  };
}

// Deactivate license by activation token
export async function deactivateLicense(activationToken: string) {
  console.log('[Service] ===== deactivateLicense called =====');
  console.log('[Service] Token:', activationToken);
  
  try {
    // Find activation by token
    console.log('[Service] Step 1: Searching for activation...');
    const activation = await db.query.activations.findFirst({
      where: eq(activations.activationToken, activationToken),
    });

    if (!activation) {
      console.error('[Service] Activation not found for token:', activationToken);
      throw new Error('Invalid activation token.');
    }

    console.log('[Service] Activation found:', { 
      id: activation.id, 
      licenseId: activation.licenseId,
      token: activation.activationToken 
    });

    // Get the associated license
    console.log('[Service] Step 2: Searching for license...');
    const license = await db.query.licenses.findFirst({
      where: eq(licenses.id, activation.licenseId),
    });

    if (!license) {
      console.error('[Service] License not found for activation:', activation.licenseId);
      throw new Error('License not found for activation token.');
    }

    console.log('[Service] License found:', { 
      id: license.id, 
      status: license.status,
      productId: license.productId 
    });

    // Perform operations sequentially (delete first, then update)
    console.log('[Service] Step 3: Deleting activation record...');
    const deleteResult = await db.delete(activations).where(eq(activations.id, activation.id));
    console.log('[Service] Delete result:', deleteResult);
    
    console.log('[Service] Step 4: Updating license status...');
    const updateResult = await db.update(licenses)
      .set({ 
        status: 'available',
        updatedAt: new Date(),
      })
      .where(eq(licenses.id, license.id));
    console.log('[Service] Update result:', updateResult);

    console.log('[Service] ===== Deactivation successful =====');
    return { success: true, message: 'License deactivated successfully' };
  } catch (error: any) {
    console.error('[Service] ===== ERROR IN DEACTIVATE SERVICE =====');
    console.error('[Service] Error type:', typeof error);
    console.error('[Service] Error message:', error?.message);
    console.error('[Service] Error stack:', error?.stack);
    console.error('[Service] Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    console.error('[Service] Error details:', {
      name: error?.name,
      code: error?.code,
      sqlState: error?.sqlState,
      sqlMessage: error?.sqlMessage,
      errno: error?.errno,
    });
    // Re-throw the original error to preserve the message
    throw error;
  }
}
