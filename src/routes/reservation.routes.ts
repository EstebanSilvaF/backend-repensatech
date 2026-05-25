import { Router } from 'express';
import { reservationController } from '../controllers/reservation.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/',   reservationController.getMine);
router.post('/',  reservationController.reserve);

export default router;
