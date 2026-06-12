import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { uploadService } from '../services/upload.service';

export const uploadController = {
  // POST /api/upload/product-image  (multipart field: image)
  async uploadProductImage(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'El archivo "image" es requerido' });
        return;
      }

      const result = await uploadService.uploadProductImage(
        req.file.buffer,
        req.file.mimetype
      );

      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
};
