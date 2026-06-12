import { pool } from '../config/db';
import { Product, CreateProductDTO, ProductFilters } from '../types/product.types';

export const productRepository = {
  async findAll(universityId: string, filters: ProductFilters): Promise<Product[]> {
    const conditions: string[] = [
      'p.university_id = $1',
      "p.status = 'available'",
    ];
    const values: any[] = [universityId];
    let idx = 2;

    if (filters.category) {
      conditions.push(`p.category = $${idx++}`);
      values.push(filters.category);
    }
    if (filters.condition) {
      conditions.push(`p.condition = $${idx++}`);
      values.push(filters.condition);
    }
    if (filters.is_donation !== undefined) {
      conditions.push(`p.is_donation = $${idx++}`);
      values.push(filters.is_donation);
    }
    if (filters.search) {
      conditions.push(`(p.name ILIKE $${idx} OR p.description ILIKE $${idx})`);
      values.push(`%${filters.search}%`);
      idx++;
    }

    const where = conditions.join(' AND ');
    const result = await pool.query<Product>(
      `SELECT p.*, u.full_name AS seller_name
       FROM products p
       JOIN users u ON u.id = p.seller_id
       WHERE ${where}
       ORDER BY p.created_at DESC`,
      values
    );
    return result.rows;
  },

  async findById(id: string): Promise<Product | null> {
    const result = await pool.query<Product>(
      `SELECT p.*, u.full_name AS seller_name, u.email AS seller_email
       FROM products p
       JOIN users u ON u.id = p.seller_id
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0] ?? null;
  },

  async findBySeller(sellerId: string): Promise<Product[]> {
    const result = await pool.query<Product>(
      `SELECT * FROM products WHERE seller_id = $1 ORDER BY created_at DESC`,
      [sellerId]
    );
    return result.rows;
  },

  async create(
    sellerId: string,
    universityId: string,
    data: CreateProductDTO
  ): Promise<Product> {
    const result = await pool.query<Product>(
      `INSERT INTO products
         (seller_id, university_id, name, description, price, is_donation,
          category, condition, image_url, image_public_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        sellerId,
        universityId,
        data.name,
        data.description ?? null,
        data.is_donation ? 0 : data.price,
        data.is_donation,
        data.category,
        data.condition,
        data.image_url,
        data.image_public_id ?? null,
      ]
    );
    return result.rows[0];
  },

  async updateStatus(id: string, status: Product['status']): Promise<void> {
    await pool.query(
      `UPDATE products SET status = $1 WHERE id = $2`,
      [status, id]
    );
  },

  async delete(id: string, sellerId: string): Promise<boolean> {
    const result = await pool.query(
      `DELETE FROM products WHERE id = $1 AND seller_id = $2`,
      [id, sellerId]
    );
    return (result.rowCount ?? 0) > 0;
  },
};
