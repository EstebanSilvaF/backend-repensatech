import { productRepository } from '../repositories/product.repository';
import { uploadService } from './upload.service';
import { CreateProductDTO, ProductFilters } from '../types/product.types';

export const productService = {
  async getAll(universityId: string, filters: ProductFilters) {
    return productRepository.findAll(universityId, filters);
  },

  async getById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) throw new Error('Producto no encontrado');
    return product;
  },

  async getMine(sellerId: string) {
    return productRepository.findBySeller(sellerId);
  },

  async create(sellerId: string, universityId: string, data: CreateProductDTO) {
    if (!data.name?.trim()) throw new Error('El nombre es requerido');
    if (!data.category)     throw new Error('La categoría es requerida');
    if (!data.condition)    throw new Error('El estado es requerido');

    if (!data.is_donation && (data.price == null || data.price < 0)) {
      throw new Error('El precio debe ser mayor o igual a 0');
    }

    if (!data.image_url?.trim()) {
      throw new Error('La imagen del producto es requerida');
    }

    if (!uploadService.isCloudinaryUrl(data.image_url)) {
      throw new Error('La imagen debe subirse mediante POST /api/upload/product-image');
    }

    return productRepository.create(sellerId, universityId, data);
  },

  async delete(id: string, sellerId: string) {
    const product = await productRepository.findById(id);
    if (!product) throw new Error('Producto no encontrado');
    if (product.seller_id !== sellerId) throw new Error('No tienes permiso para eliminar este producto');
    if (product.status !== 'available') throw new Error('No puedes eliminar un producto reservado o vendido');

    const deleted = await productRepository.delete(id, sellerId);
    if (!deleted) throw new Error('No se pudo eliminar el producto');

    if (product.image_public_id) {
      try {
        await uploadService.deleteProductImage(product.image_public_id);
      } catch {
        // La imagen en Cloudinary se limpia en segundo plano; el producto ya se eliminó en BD
      }
    }
  },
};
