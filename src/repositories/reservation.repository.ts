import { pool } from '../config/db';
import { Reservation } from '../types/shared.types';

export const reservationRepository = {
  async findActiveByProduct(productId: string): Promise<Reservation | null> {
    const result = await pool.query<Reservation>(
      `SELECT * FROM reservations WHERE product_id = $1 AND status = 'active'`,
      [productId]
    );
    return result.rows[0] ?? null;
  },

  async findByBuyer(buyerId: string): Promise<Reservation[]> {
    const result = await pool.query<Reservation>(
      `SELECT r.*,
              p.name      AS product_name,
              p.image_url AS product_image,
              p.price     AS product_price
       FROM reservations r
       JOIN products p ON p.id = r.product_id
       WHERE r.buyer_id = $1
       ORDER BY r.created_at DESC`,
      [buyerId]
    );
    return result.rows;
  },

  async create(
    productId: string,
    buyerId: string,
    feePaid: number,
    expiresAt: Date
  ): Promise<Reservation> {
    const result = await pool.query<Reservation>(
      `INSERT INTO reservations (product_id, buyer_id, fee_paid, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [productId, buyerId, feePaid, expiresAt]
    );
    return result.rows[0];
  },

  async updateStatus(id: string, status: ReservationStatus): Promise<void> {
    await pool.query(
      `UPDATE reservations SET status = $1 WHERE id = $2`,
      [status, id]
    );
  },

  // Expirar reservas vencidas y devolver productos a 'available'
  async expireOverdue(): Promise<number> {
    const result = await pool.query(
      `WITH expired AS (
         UPDATE reservations
         SET status = 'expired'
         WHERE status = 'active' AND expires_at < NOW()
         RETURNING product_id
       )
       UPDATE products
       SET status = 'available'
       WHERE id IN (SELECT product_id FROM expired)
         AND status = 'reserved'`
    );
    return result.rowCount ?? 0;
  },
};

// Re-exportar tipo para usarlo en el repository sin importar de types
type ReservationStatus = 'active' | 'completed' | 'expired';
