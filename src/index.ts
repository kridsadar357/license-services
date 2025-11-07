import 'dotenv/config';
import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { licenseController } from './modules/license/license.controller';
import { productController } from './modules/product/product.controller';
import { adminController } from './modules/admin/admin.controller';
import { supportController } from './modules/support/support.controller';

const app = new Elysia()
  // === Plugins (Security & Utility) ===
  .use(cors()) // อนุญาต Cross-Origin (ถ้าจำเป็น)
  .use(swagger()) // สร้างหน้า Docs API (ไปที่ /swagger)
  // Note: Rate limiting can be added later with a compatible package

  // === Request Logging ===
  .onRequest(({ request }) => {
    console.log(`[${new Date().toISOString()}] ${request.method} ${request.url}`);
  })

  // === Global Error Handler ===
  .onError(({ code, error, set }) => {
    console.error(`[Global Error Handler] ${code}:`, {
      message: error instanceof Error ? error.message : 'Unknown error',
      error: error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    if (code === 'VALIDATION') {
      set.status = 422; // Unprocessable Entity
      return {
        success: false,
        message: 'Input validation failed',
        errors: error.all.map((e: any) => `${e.path.replace('/', '')}: ${e.message}`),
      };
    }
    
    // Don't override errors that were already handled by controllers
    // Only catch unhandled errors
    set.status = 500;
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    console.error(`[Global Error Handler] Returning error: ${errorMessage}`);
    return { 
      success: false, 
      message: errorMessage,
      code: code,
    };
  })

  // === Health Check ===
  .get('/health', () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'license-service',
  }))

  // === API Routes ===
  // จัดกลุ่ม API ภายใต้ /api/v1 (ดีสำหรับการทำ Versioning)
  .group('/api/v1', (app) =>
    app
      .use(licenseController)
      .use(productController)
      .use(adminController)
      .use(supportController)
  )

  .listen(process.env.PORT || 3000);

console.log(
  `🦊 License Service is running at ${app.server?.hostname}:${app.server?.port}`
);

