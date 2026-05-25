import { Router } from 'express';
import { chatController } from '../controllers/chat.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/',                          chatController.getMyChats);
router.get('/:id',                       chatController.getById);
router.post('/',                         chatController.openChat);
router.get('/:id/messages',              chatController.getMessages);
router.post('/:id/messages',             chatController.sendMessage);
router.patch('/:id/confirm-delivery',    chatController.confirmDelivery);

export default router;
