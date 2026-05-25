import { pool } from '../../src/config/db';
import { User, CreateUserDTO } from '../types/user.types';

export const userRepository = {
  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query<User>(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] ?? null;
  },

  async findById(id: string): Promise<User | null> {
    const result = await pool.query<User>(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] ?? null;
  },

  async create(data: CreateUserDTO & { password_hash: string }): Promise<User> {
    const result = await pool.query<User>(
      `INSERT INTO users (university_id, full_name, email, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.university_id, data.full_name, data.email, data.password_hash]
    );
    return result.rows[0];
  },
};
