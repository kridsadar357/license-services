import { Elysia, t } from 'elysia';
import { ActivateLicenseSchema } from './license.schema';
import { activateLicense, verifyLicense, deactivateLicense } from './license.service';

export const licenseController = new Elysia({ prefix: '/license' })
  .post(
    '/activate',
    async ({ body, set }) => {
      try {
        const { licenseKey, hardwareId, productId, customerEmail, customerName } = body;
        const result = await activateLicense(productId, licenseKey, hardwareId, customerEmail, customerName);
        
        return {
          success: true,
          token: result.activationToken,
        };
      } catch (error: any) {
        // จัดการ Error ที่ส่งมาจาก Service
        set.status = 400; // Bad Request (หรือ 404, 403 ขึ้นอยู่กับ Error)
        return {
          success: false,
          message: error.message,
        };
      }
    },
    {
      // ใช้ Schema เพื่อ Validate ข้อมูลที่ส่งมาอัตโนมัติ (Security)
      body: ActivateLicenseSchema,
      detail: {
        summary: 'Activate a Software License',
        tags: ['License'],
      },
    }
  )
  .post(
    '/verify',
    async ({ body, set }) => {
      try {
        const { activationToken } = body;
        const result = await verifyLicense(activationToken);
        
        return {
          success: true,
          ...result,
        };
      } catch (error: any) {
        set.status = 400;
        return {
          success: false,
          valid: false,
          message: error.message,
        };
      }
    },
    {
      body: t.Object({
        activationToken: t.String({
          minLength: 1,
          error: 'Activation token is required.',
        }),
      }),
      detail: {
        summary: 'Verify an Activation Token',
        description: 'Check if an activation token is valid and get license information',
        tags: ['License'],
      },
    }
  )
  .post(
    '/deactivate',
    async ({ body, set }) => {
      console.log('[API] ===== Deactivate endpoint called =====');
      console.log('[API] Request body:', JSON.stringify(body, null, 2));
      console.log('[API] Body type:', typeof body);
      
      try {
        const { activationToken } = body as { activationToken: string };
        console.log('[API] Extracted activationToken:', activationToken);
        
        if (!activationToken) {
          console.error('[API] Missing activation token');
          set.status = 400;
          return { 
            success: false, 
            message: 'Activation token is required'
          };
        }
        
        console.log('[API] Calling deactivateLicense with token:', activationToken);
        const result = await deactivateLicense(activationToken);
        console.log('[API] Deactivation result:', result);
        return result;
      } catch (error: any) {
        console.error('[API] ===== ERROR IN DEACTIVATE ENDPOINT =====');
        console.error('[API] Error type:', typeof error);
        console.error('[API] Error constructor:', error?.constructor?.name);
        console.error('[API] Error message:', error?.message);
        console.error('[API] Error stack:', error?.stack);
        console.error('[API] Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        console.error('[API] Error details:', {
          name: error?.name,
          code: error?.code,
          sqlState: error?.sqlState,
          sqlMessage: error?.sqlMessage,
          errno: error?.errno,
          body: body,
        });
        
        set.status = 500;
        const errorMessage = error?.message || 'Failed to deactivate license';
        console.error('[API] Returning error response with message:', errorMessage);
        
        const errorResponse = { 
          success: false, 
          message: errorMessage,
          error: error?.name || 'UnknownError',
        };
        
        console.error('[API] Error response:', JSON.stringify(errorResponse, null, 2));
        return errorResponse;
      }
    },
    {
      body: t.Object({
        activationToken: t.String({
          minLength: 1,
          error: 'Activation token is required.',
        }),
      }),
      detail: {
        summary: 'Deactivate a license',
        description: 'Deactivate a license using activation token and make it available again',
        tags: ['License'],
      },
    }
  );
