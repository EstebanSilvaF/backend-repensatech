import { cloudinary, ensureCloudinaryConfig, getCloudinaryCloudName } from '../../infrastructure/config/cloudinary';

const PRODUCT_FOLDER = 'repensa/products';

export interface UploadedImage {
  image_url: string;
  image_public_id: string;
  width: number;
  height: number;
}

export const uploadService = {
  async uploadProductImage(buffer: Buffer, mimetype: string): Promise<UploadedImage> {
    ensureCloudinaryConfig();

    const dataUri = `data:${mimetype};base64,${buffer.toString('base64')}`;

    try {
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: PRODUCT_FOLDER,
        resource_type: 'image',
      });

      return {
        image_url: result.secure_url,
        image_public_id: result.public_id,
        width: result.width,
        height: result.height,
      };
    } catch (error: any) {
      if (error?.message?.includes('Invalid Signature')) {
        throw new Error(
          'Credenciales de Cloudinary inválidas. Revisa CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en .env (Dashboard → API Keys). Reinicia el servidor después de cambiarlas.'
        );
      }
      throw error;
    }
  },

  async deleteProductImage(publicId: string): Promise<void> {
    ensureCloudinaryConfig();
    await cloudinary.uploader.destroy(publicId);
  },

  isCloudinaryUrl(url: string): boolean {
    try {
      const cloudName = getCloudinaryCloudName();
      return url.includes(`res.cloudinary.com/${cloudName}/`);
    } catch {
      return false;
    }
  },
};
