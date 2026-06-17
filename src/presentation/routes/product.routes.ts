import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

router.use(authMiddleware);

router.get('/',        asyncHandler(productController.getAll));
router.get('/mine',    asyncHandler(productController.getMine));
router.get('/:id',     asyncHandler(productController.getById));
router.post('/',       asyncHandler(productController.create));
router.delete('/:id',  asyncHandler(productController.remove));

export default router;
