import { pool } from '../config/db';
import { Notification } from '../types/shared.types';

export const notificationRepository = {
  async findByUser(userId: string): Promise<Notification[]> {
    const result = await pool.query<Notification>(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );
    return result.rows;
  },

  async markAllRead(userId: string): Promise<void> {
    await pool.query(
      `UPDATE notifications SET is_read = TRUE WHERE user_id = $1`,
      [userId]
    );
  },

  async markOneRead(id: string, userId: string): Promise<void> {
    await pool.query(
      `UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
  },

  async countUnread(userId: string): Promise<number> {
    const result = await pool.query<{ count: string }>(
      `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
      [userId]
    );
    return parseInt(result.rows[0].count, 10);
  },
};
