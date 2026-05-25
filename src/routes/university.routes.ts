import { Router } from 'express';
import { universityController } from '../controllers/university.controller';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', universityController.getAll);

router.use(authMiddleware, adminMiddleware);
router.post('/',                    universityController.create);
router.patch('/:id/status',         universityController.updateStatus);

export default router;
