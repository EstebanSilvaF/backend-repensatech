import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db';
import { userRepository } from '../repositories/user.repository';
import { CreateUserDTO, LoginDTO, AuthPayload } from '../types/user.types';

const SALT_ROUNDS = 10;

export const userService = {
  async register(data: CreateUserDTO) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) throw new Error('El correo ya está registrado');

     const uniResult = await pool.query(
      `SELECT id, email_domain, subscription_status
       FROM universities
       WHERE id = $1`,
      [data.university_id]
    );
    const university = uniResult.rows[0];
    if (!university) throw new Error('Universidad no encontrada');
    if (university.subscription_status !== 'active') {
      throw new Error('La universidad no tiene una suscripción activa');
    }

    const emailDomain = data.email.split('@')[1];
    if (emailDomain !== university.email_domain) {
      throw new Error('El correo no pertenece a esta universidad');
    }

    const password_hash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const user = await userRepository.create({ ...data, password_hash });

    return sanitizeUser(user);
  },

  async login(data: LoginDTO) {
    const user = await userRepository.findByEmail(data.email);
    if (!user) throw new Error('Credenciales inválidas');

    const valid = await bcrypt.compare(data.password, user.password_hash);
    if (!valid) throw new Error('Credenciales inválidas');

    const payload: AuthPayload = {
      userId: user.id,
      universityId: user.university_id,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: '7d',
    });

    return { token, user: sanitizeUser(user) };
  },
};


function sanitizeUser(user: any) {
  const { password_hash, ...safe } = user;
  return safe;
}
