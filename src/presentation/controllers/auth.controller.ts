import { Request, Response } from 'express';
import { userService } from '../../application/services/user.service';

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const { university_id, full_name, email, password } = req.body;
    const user = await userService.register({ university_id, full_name, email, password });
    res.status(201).json({ message: 'Cuenta creada exitosamente', user });
  },

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    const result = await userService.login({ email, password });
    res.status(200).json(result);
  },
};
