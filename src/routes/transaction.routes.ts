// ── REPOSITORY ────────────────────────────────────────────────
import { pool } from '../config/db';
import { Transaction } from '../types/shared.types';
import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';

const transactionRepository = {
  async findByUser(userId: string): Promise<Transaction[]> {
    const result = await pool.query<Transaction>(
      `SELECT t.*,
              p.name        AS product_name,
              p.image_url   AS product_image,
              p.category    AS product_category,
              b.full_name   AS buyer_name,
              s.full_name   AS seller_name,
              CASE
                WHEN t.buyer_id  = $1 THEN 'purchase'
                WHEN t.seller_id = $1 THEN 'sale'
              END AS direction
       FROM transactions t
       JOIN products p ON p.id = t.product_id
       JOIN users b    ON b.id = t.buyer_id
       JOIN users s    ON s.id = t.seller_id
       WHERE t.buyer_id = $1 OR t.seller_id = $1
       ORDER BY t.confirmed_at DESC`,
      [userId]
    );
    return result.rows;
  },
};

// ── SERVICE ───────────────────────────────────────────────────
const transactionService = {
  async getHistory(userId: string) {
    return transactionRepository.findByUser(userId);
  },
};

// ── CONTROLLER ────────────────────────────────────────────────
const transactionController = {
  // GET /api/transactions
  async getHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const history = await transactionService.getHistory(req.user!.userId);
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
};

// ── ROUTES ────────────────────────────────────────────────────
const router = Router();
router.use(authMiddleware);
router.get('/', transactionController.getHistory);

export default router;
