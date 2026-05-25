import { Response } from 'express';
import { chatService } from '../services/chat.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export const chatController = {
  // GET /api/chats
  async getMyChats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const chats = await chatService.getMyChats(req.user!.userId);
      res.json(chats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  // GET /api/chats/:id
  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const chat = await chatService.getById(req.params.id as string, req.user!.userId);
      res.json(chat);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  },

  // POST /api/chats  { product_id }
  async openChat(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { product_id } = req.body;
      if (!product_id) {
        res.status(400).json({ message: 'product_id es requerido' });
        return;
      }
      const chat = await chatService.openChat(product_id, req.user!.userId);
      res.status(201).json(chat);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  // GET /api/chats/:id/messages
  async getMessages(req: AuthRequest, res: Response): Promise<void> {
    try {
      const messages = await chatService.getMessages(req.params.id as string, req.user!.userId);
      res.json(messages);
    } catch (error: any) {
      res.status(403).json({ message: error.message });
    }
  },

  // POST /api/chats/:id/messages  { content }
  async sendMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { content } = req.body;
      if (!content) {
        res.status(400).json({ message: 'El contenido del mensaje es requerido' });
        return;
      }
      const message = await chatService.sendMessage(req.params.id as string, req.user!.userId, content);
      res.status(201).json(message);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  // PATCH /api/chats/:id/confirm-delivery
  async confirmDelivery(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await chatService.confirmDelivery(req.params.id as string, req.user!.userId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
};
