import { Elysia } from 'elysia';
import { CreateLicenseSchema, UpdateLicenseSchema } from './admin.schema';
import {
  createLicense,
  getLicenses,
  getLicenseById,
  updateLicense,
  deleteLicense,
  toggleLicenseEnabled,
} from './admin.service';

export const adminController = new Elysia({ prefix: '/admin/licenses' })
  .get(
    '/',
    async ({ query, set }) => {
      try {
        const search = query.search as string | undefined;
        const productId = query.productId as string | undefined;
        const status = query.status as string | undefined;
        const licenses = await getLicenses(search, productId, status);
        return { success: true, data: licenses };
      } catch (error: any) {
        set.status = 500;
        return { success: false, message: error.message };
      }
    },
    {
      detail: {
        summary: 'Get all licenses (admin)',
        tags: ['Admin'],
      },
    }
  )
  .get(
    '/:id',
    async ({ params, set }) => {
      try {
        const id = parseInt(params.id);
        const license = await getLicenseById(id);
        if (!license) {
          set.status = 404;
          return { success: false, message: 'License not found' };
        }
        return { success: true, data: license };
      } catch (error: any) {
        set.status = 500;
        return { success: false, message: error.message };
      }
    },
    {
      detail: {
        summary: 'Get license by ID (admin)',
        tags: ['Admin'],
      },
    }
  )
  .post(
    '/',
    async ({ body, set }) => {
      try {
        const license = await createLicense(body);
        return { success: true, data: license };
      } catch (error: any) {
        set.status = 400;
        return { success: false, message: error.message };
      }
    },
    {
      body: CreateLicenseSchema,
      detail: {
        summary: 'Create a new license (admin)',
        tags: ['Admin'],
      },
    }
  )
  .put(
    '/:id',
    async ({ params, body, set }) => {
      try {
        const id = parseInt(params.id);
        const license = await updateLicense(id, body);
        return { success: true, data: license };
      } catch (error: any) {
        set.status = 400;
        return { success: false, message: error.message };
      }
    },
    {
      body: UpdateLicenseSchema,
      detail: {
        summary: 'Update a license (admin)',
        tags: ['Admin'],
      },
    }
  )
  .patch(
    '/:id/toggle',
    async ({ params, body, set }) => {
      try {
        const id = parseInt(params.id);
        const { enabled } = body as { enabled: boolean };
        const license = await toggleLicenseEnabled(id, enabled);
        return { success: true, data: license };
      } catch (error: any) {
        set.status = 400;
        return { success: false, message: error.message };
      }
    },
    {
      body: { enabled: Boolean },
      detail: {
        summary: 'Enable/disable a license (admin)',
        tags: ['Admin'],
      },
    }
  )
  .delete(
    '/:id',
    async ({ params, set }) => {
      try {
        const id = parseInt(params.id);
        await deleteLicense(id);
        return { success: true, message: 'License deleted successfully' };
      } catch (error: any) {
        set.status = 400;
        return { success: false, message: error.message };
      }
    },
    {
      detail: {
        summary: 'Delete a license (admin)',
        tags: ['Admin'],
      },
    }
  );

