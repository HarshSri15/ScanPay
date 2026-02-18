import { Router, Response } from 'express';
import Order from '../models/Order';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/orders — get all orders for current user
router.get('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ orders });
  } catch {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:orderId — get single order
router.get('/:orderId', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: req.userId,
    }).lean();

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json({ order });
  } catch {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

export default router;
