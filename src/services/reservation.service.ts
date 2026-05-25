import { pool } from '../config/db';
import { reservationRepository } from '../repositories/reservation.repository';
import { productRepository } from '../repositories/product.repository';

const RESERVATION_FEE    = 2000;  // COP — tarifa fija de reserva
const RESERVATION_DAYS   = 7;

export const reservationService = {
  async getMyReservations(buyerId: string) {
    return reservationRepository.findByBuyer(buyerId);
  },

  async reserve(productId: string, buyerId: string) {
    const product = await productRepository.findById(productId);
    if (!product) throw new Error('Producto no encontrado');
    if (product.status !== 'available') throw new Error('Este producto no está disponible para reservar');
    if (product.seller_id === buyerId)  throw new Error('No puedes reservar tu propio producto');

    // Verificar que no haya ya una reserva activa
    const existing = await reservationRepository.findActiveByProduct(productId);
    if (existing) throw new Error('Este producto ya está reservado');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + RESERVATION_DAYS);

    // Crear reserva y marcar producto como reservado en una transacción
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const reservation = await reservationRepository.create(
        productId,
        buyerId,
        RESERVATION_FEE,
        expiresAt
      );

      await client.query(
        `UPDATE products SET status = 'reserved' WHERE id = $1`,
        [productId]
      );

      // Notificar al vendedor
      await client.query(
        `INSERT INTO notifications (user_id, type, title, description, reference_id, reference_type)
         VALUES ($1, 'reservation_confirmed', 'Tu producto fue reservado',
                 $2, $3, 'reservation')`,
        [
          product.seller_id,
          `Alguien reservó "${product.name}". Tiene 7 días para completar la compra.`,
          reservation.id,
        ]
      );

      await client.query('COMMIT');
      return reservation;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  // Llamado por el cron job
  async expireOverdue() {
    const count = await reservationRepository.expireOverdue();
    if (count > 0) {
      console.log(`⏰ ${count} reservas expiradas y productos devueltos a disponible`);
    }
  },
};
