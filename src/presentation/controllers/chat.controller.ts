import { Response } from 'express';
import { chatService } from '../../application/services/chat.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { createHttpError } from '../middlewares/error.middleware';

export const chatController = {
  async getMyChats(req: AuthRequest, res: Response): Promise<void> {
    const chats = await chatService.getMyChats(req.user!.userId);
    res.json(chats);
  },

  async getById(req: AuthRequest, res: Response): Promise<void> {
    const chat = await chatService.getById(req.params.id as string, req.user!.userId);
    res.json(chat);
  },

  async openChat(req: AuthRequest, res: Response): Promise<void> {
    const { product_id } = req.body;
    if (!product_id) {
      throw createHttpError(400, 'product_id es requerido');
    }

    const chat = await chatService.openChat(product_id, req.user!.userId);
    res.status(201).json(chat);
  },

  async getMessages(req: AuthRequest, res: Response): Promise<void> {
    const messages = await chatService.getMessages(req.params.id as string, req.user!.userId);
    res.json(messages);
  },

  async sendMessage(req: AuthRequest, res: Response): Promise<void> {
    const { content } = req.body;
    if (!content) {
      throw createHttpError(400, 'El contenido del mensaje es requerido');
    }

    const message = await chatService.sendMessage(
      req.params.id as string,
      req.user!.userId,
      content
    );
    res.status(201).json(message);
  },

  async confirmDelivery(req: AuthRequest, res: Response): Promise<void> {
    const result = await chatService.confirmDelivery(req.params.id as string, req.user!.userId);
    res.json(result);
  },
};
