import { Elysia, t } from 'elysia';
import { CreateProductSchema, UpdateProductSchema } from './product.schema';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from './product.service';

const GetProductsQuerySchema = t.Object({
  search: t.Optional(t.String()),
});

export const productController = new Elysia({ prefix: '/products' })
  .get(
    '/',
    async ({ query, set }) => {
      try {
        const search = query.search;
        const products = await getProducts(search);
        return { success: true, data: products };
      } catch (error: any) {
        set.status = 500;
        return { success: false, message: error.message };
      }
    },
    {
      query: GetProductsQuerySchema,
      detail: {
        summary: 'Get all products',
        tags: ['Products'],
      },
    }
  )
  .get(
    '/:id',
    async ({ params, set }) => {
      try {
        const id = parseInt(params.id);
        const product = await getProductById(id);
        if (!product) {
          set.status = 404;
          return { success: false, message: 'Product not found' };
        }
        return { success: true, data: product };
      } catch (error: any) {
        set.status = 500;
        return { success: false, message: error.message };
      }
    },
    {
      detail: {
        summary: 'Get product by ID',
        tags: ['Products'],
      },
    }
  )
  .post(
    '/',
    async ({ body, set }) => {
      try {
        const product = await createProduct(body);
        return { success: true, data: product };
      } catch (error: any) {
        set.status = 400;
        return { 
          success: false, 
          message: error.message || 'Failed to create product',
          errors: error.errors || []
        };
      }
    },
    {
      body: CreateProductSchema,
      detail: {
        summary: 'Create a new product',
        tags: ['Products'],
      },
    }
  )
  .put(
    '/:id',
    async ({ params, body, set }) => {
      try {
        const id = parseInt(params.id);
        const product = await updateProduct(id, body);
        return { success: true, data: product };
      } catch (error: any) {
        set.status = 400;
        return { success: false, message: error.message };
      }
    },
    {
      body: UpdateProductSchema,
      detail: {
        summary: 'Update a product',
        tags: ['Products'],
      },
    }
  )
  .delete(
    '/:id',
    async ({ params, set }) => {
      try {
        const id = parseInt(params.id);
        await deleteProduct(id);
        return { success: true, message: 'Product deleted successfully' };
      } catch (error: any) {
        set.status = 400;
        return { success: false, message: error.message };
      }
    },
    {
      detail: {
        summary: 'Delete a product',
        tags: ['Products'],
      },
    }
  );

