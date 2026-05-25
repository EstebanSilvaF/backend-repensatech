import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas de productos requieren autenticación
router.use(authMiddleware);

router.get('/',        productController.getAll);
router.get('/mine',    productController.getMine);
router.get('/:id',     productController.getById);
router.post('/',       productController.create);
router.delete('/:id',  productController.remove);

export default router;
