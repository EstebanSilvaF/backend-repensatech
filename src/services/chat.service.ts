import { pool } from '../config/db';
import { chatRepository } from '../repositories/chat.repository';
import { productRepository } from '../repositories/product.repository';

export const chatService = {
  async getMyChats(userId: string) {
    return chatRepository.findByUser(userId);
  },

  async getById(chatId: string, userId: string) {
    const chat = await chatRepository.findById(chatId);
    if (!chat) throw new Error('Chat no encontrado');

    // Solo el comprador o vendedor pueden ver el chat
    if (chat.buyer_id !== userId && chat.seller_id !== userId) {
      throw new Error('No tienes acceso a este chat');
    }
    return chat;
  },

  async openChat(productId: string, buyerId: string) {
    const product = await productRepository.findById(productId);
    if (!product) throw new Error('Producto no encontrado');
    if (product.status === 'sold') throw new Error('Este producto ya fue vendido');

    // El vendedor no puede abrirse un chat a sí mismo
    if (product.seller_id === buyerId) {
      throw new Error('No puedes abrir un chat sobre tu propio producto');
    }

    // Si ya existe un chat entre este comprador y producto, lo devuelve
    const existing = await chatRepository.findByProductAndBuyer(productId, buyerId);
    if (existing) return existing;

    return chatRepository.create(productId, buyerId, product.seller_id);
  },

  async getMessages(chatId: string, userId: string) {
    // Verificar acceso al chat
    await chatService.getById(chatId, userId);
    return chatRepository.getMessages(chatId);
  },

  async sendMessage(chatId: string, senderId: string, content: string) {
    if (!content?.trim()) throw new Error('El mensaje no puede estar vacío');

    const chat = await chatRepository.findById(chatId);
    if (!chat) throw new Error('Chat no encontrado');
    if (chat.buyer_id !== senderId && chat.seller_id !== senderId) {
      throw new Error('No tienes acceso a este chat');
    }
    if (chat.status === 'delivery_confirmed') {
      throw new Error('Este chat ya fue cerrado con entrega confirmada');
    }

    return chatRepository.createMessage(chatId, senderId, content.trim());
  },

  async confirmDelivery(chatId: string, userId: string) {
    const chat = await chatRepository.findById(chatId);
    if (!chat) throw new Error('Chat no encontrado');
    if (chat.buyer_id !== userId && chat.seller_id !== userId) {
      throw new Error('No tienes acceso a este chat');
    }
    if (chat.status === 'delivery_confirmed') {
      throw new Error('La entrega ya fue confirmada');
    }

    // Confirmar entrega en el chat
    await chatRepository.confirmDelivery(chatId);

    // Marcar el producto como vendido
    await pool.query(
      `UPDATE products SET status = 'sold' WHERE id = $1`,
      [chat.product_id]
    );

    // Crear la transacción en el historial
    const productResult = await pool.query(
      `SELECT price FROM products WHERE id = $1`,
      [chat.product_id]
    );
    const price = productResult.rows[0]?.price ?? 0;

    // Ver si había reserva activa o completada para este producto
    const reservationResult = await pool.query(
      `SELECT id FROM reservations
       WHERE product_id = $1 AND buyer_id = $2
       ORDER BY created_at DESC LIMIT 1`,
      [chat.product_id, chat.buyer_id]
    );
    const reservationId = reservationResult.rows[0]?.id ?? null;

    await pool.query(
      `INSERT INTO transactions
         (product_id, seller_id, buyer_id, chat_id, reservation_id, final_price)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [chat.product_id, chat.seller_id, chat.buyer_id, chatId, reservationId, price]
    );

    return { message: 'Entrega confirmada. Transacción registrada en el historial.' };
  },
};
