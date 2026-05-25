import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { universityService } from '../services/university.service';
import { getRouteParam } from '../utils/params';

export const universityController = {
    // GET /api/universities (público, para registro)
    async getAll(_req: Request, res: Response): Promise<void> {
      try {
        const universities = await universityService.getAll();
        res.json(universities);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  
    // POST /api/universities
    async create(req: AuthRequest, res: Response): Promise<void> {
      try {
        const { name, email_domain, subscription_start, subscription_end } = req.body;
        const university = await universityService.create({
          name, email_domain, subscription_start, subscription_end,
        });
        res.status(201).json(university);
      } catch (error: any) {
        res.status(400).json({ message: error.message });
      }
    },
  
    // PATCH /api/universities/:id/status
    async updateStatus(req: AuthRequest, res: Response): Promise<void> {
      try {
        const { status } = req.body;
        if (!status) {
          res.status(400).json({ message: 'status es requerido' });
          return;
        }
        const id = getRouteParam(req.params.id);
        if (!id) {
          res.status(400).json({ message: 'id inválido' });
          return;
        }
        const university = await universityService.updateStatus(id, status);
        res.json(university);
      } catch (error: any) {
        res.status(400).json({ message: error.message });
      }
    },
  };
  