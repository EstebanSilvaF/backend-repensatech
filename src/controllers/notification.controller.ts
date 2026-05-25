import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { notificationService } from '../services/notification.service';
import { getRouteParam } from '../utils/params';

export const notificationController = {
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = await notificationService.getAll(req.user!.userId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  async markAllRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      await notificationService.markAllRead(req.user!.userId);
      res.json({ message: 'Notificaciones marcadas como leídas' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  async markOneRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = getRouteParam(req.params.id);
      if (!id) {
        res.status(400).json({ message: 'id inválido' });
        return;
      }
      await notificationService.markOneRead(id, req.user!.userId);
      res.json({ message: 'Notificación marcada como leída' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
};
