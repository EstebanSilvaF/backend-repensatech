import { Request, Response } from 'express';
import { userService } from '../services/user.service';

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { university_id, full_name, email, password } = req.body;

      if (!university_id || !full_name || !email || !password) {
        res.status(400).json({ message: 'Todos los campos son requeridos' });
        return;
      }

      if (password.length < 8) {
        res.status(400).json({ message: 'La contraseña debe tener mínimo 8 caracteres' });
        return;
      }

      const user = await userService.register({ university_id, full_name, email, password });
      res.status(201).json({ message: 'Cuenta creada exitosamente', user });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: 'Correo y contraseña son requeridos' });
        return;
      }

      const result = await userService.login({ email, password });
      res.status(200).json(result);
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  },
};
