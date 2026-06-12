import { Response } from 'express';
import { productService } from '../services/product.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { ProductCategory, ProductCondition } from '../types/product.types';

export const productController = {
  // GET /api/products
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const universityId = req.user!.universityId;
      const { category, condition, is_donation, search } = req.query;

      const products = await productService.getAll(universityId, {
        category:    category as ProductCategory,
        condition:   condition as ProductCondition,
        is_donation: is_donation !== undefined ? is_donation === 'true' : undefined,
        search:      search as string,
      });

      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  // GET /api/products/mine
  async getMine(req: AuthRequest, res: Response): Promise<void> {
    try {
      const products = await productService.getMine(req.user!.userId);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  // GET /api/products/:id
  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const product = await productService.getById(req.params.id as string);
      res.json(product);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  },

  // POST /api/products
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const {
        name, description, price, is_donation, category, condition,
        image_url, image_public_id,
      } = req.body;

      const product = await productService.create(
        req.user!.userId,
        req.user!.universityId,
        { name, description, price, is_donation, category, condition, image_url, image_public_id }
      );

      res.status(201).json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  // DELETE /api/products/:id
  async remove(req: AuthRequest, res: Response): Promise<void> {
    try {
      await productService.delete(req.params.id as string, req.user!.userId);
      res.json({ message: 'Producto eliminado' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
};
