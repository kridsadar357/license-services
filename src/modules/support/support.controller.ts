import { Elysia, t } from 'elysia';
import {
  searchByLicenseKey,
  searchByActivationToken,
  searchByCustomerEmail,
  searchByCustomerName,
  searchByProductId,
  getLicenseStats,
} from './support.service';

export const supportController = new Elysia({ prefix: '/support' })
  .get(
    '/search',
    async ({ query, set }) => {
      try {
        const { type, value } = query as { type: string; value: string };

        if (!type || !value) {
          set.status = 400;
          return { success: false, message: 'Type and value are required' };
        }

        let result;
        switch (type) {
          case 'licenseKey':
            result = await searchByLicenseKey(value);
            break;
          case 'activationToken':
            result = await searchByActivationToken(value);
            break;
          case 'customerEmail':
            result = await searchByCustomerEmail(value);
            break;
          case 'customerName':
            result = await searchByCustomerName(value);
            break;
          case 'productId':
            result = await searchByProductId(value);
            break;
          default:
            set.status = 400;
            return { success: false, message: 'Invalid search type' };
        }

        return { success: true, data: result };
      } catch (error: any) {
        set.status = 500;
        return { success: false, message: error.message };
      }
    },
    {
      query: t.Object({
        type: t.String(),
        value: t.String(),
      }),
      detail: {
        summary: 'Search license information',
        description: 'Search by licenseKey, activationToken, customerEmail, customerName, or productId',
        tags: ['Support'],
      },
    }
  )
  .get(
    '/stats',
    async ({ set }) => {
      try {
        const stats = await getLicenseStats();
        return { success: true, data: stats };
      } catch (error: any) {
        set.status = 500;
        return { success: false, message: error.message };
      }
    },
    {
      detail: {
        summary: 'Get license statistics',
        tags: ['Support'],
      },
    }
  );

