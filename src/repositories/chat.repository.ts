import { pool } from '../config/db';
import { Chat, Message } from '../types/chat.types';

export const chatRepository = {
  // Buscar chat existente entre comprador y producto
  async findByProductAndBuyer(productId: string, buyerId: string): Promise<Chat | null> {
    const result = await pool.query<Chat>(
      `SELECT * FROM chats WHERE product_id = $1 AND buyer_id = $2`,
      [productId, buyerId]
    );
    return result.rows[0] ?? null;
  },

  async findById(id: string): Promise<Chat | null> {
    const result = await pool.query<Chat>(
      `SELECT c.*,
              p.name        AS product_name,
              p.price       AS product_price,
              p.image_url   AS product_image,
              b.full_name   AS buyer_name,
              s.full_name   AS seller_name
       FROM chats c
       JOIN products p ON p.id = c.product_id
       JOIN users b    ON b.id = c.buyer_id
       JOIN users s    ON s.id = c.seller_id
       WHERE c.id = $1`,
      [id]
    );
    return result.rows[0] ?? null;
  },

  // Todos los chats de un usuario (como comprador o vendedor)
  async findByUser(userId: string): Promise<Chat[]> {
    const result = await pool.query<Chat>(
      `SELECT c.*,
              p.name        AS product_name,
              p.price       AS product_price,
              p.image_url   AS product_image,
              b.full_name   AS buyer_name,
              s.full_name   AS seller_name,
              (SELECT content FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message,
              (SELECT created_at FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message_at
       FROM chats c
       JOIN products p ON p.id = c.product_id
       JOIN users b    ON b.id = c.buyer_id
       JOIN users s    ON s.id = c.seller_id
       WHERE c.buyer_id = $1 OR c.seller_id = $1
       ORDER BY last_message_at DESC NULLS LAST`,
      [userId]
    );
    return result.rows;
  },

  async create(productId: string, buyerId: string, sellerId: string): Promise<Chat> {
    const result = await pool.query<Chat>(
      `INSERT INTO chats (product_id, buyer_id, seller_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [productId, buyerId, sellerId]
    );
    return result.rows[0];
  },

  async confirmDelivery(id: string): Promise<void> {
    await pool.query(
      `UPDATE chats SET status = 'delivery_confirmed' WHERE id = $1`,
      [id]
    );
  },

  // ── MENSAJES ──────────────────────────────────────────────

  async getMessages(chatId: string): Promise<Message[]> {
    const result = await pool.query<Message>(
      `SELECT m.*, u.full_name AS sender_name
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.chat_id = $1
       ORDER BY m.created_at ASC`,
      [chatId]
    );
    return result.rows;
  },

  async createMessage(chatId: string, senderId: string, content: string): Promise<Message> {
    const result = await pool.query<Message>(
      `INSERT INTO messages (chat_id, sender_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [chatId, senderId, content]
    );
    return result.rows[0];
  },
};
