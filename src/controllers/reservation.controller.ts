import { Response } from 'express';
import { reservationService } from '../services/reservation.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export const reservationController = {
  // GET /api/reservations
  async getMine(req: AuthRequest, res: Response): Promise<void> {
    try {
      const reservations = await reservationService.getMyReservations(req.user!.userId);
      res.json(reservations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  // POST /api/reservations  { product_id }
  async reserve(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { product_id } = req.body;
      if (!product_id) {
        res.status(400).json({ message: 'product_id es requerido' });
        return;
      }
      const reservation = await reservationService.reserve(product_id, req.user!.userId);
      res.status(201).json(reservation);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
};
