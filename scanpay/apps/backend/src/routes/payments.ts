import { Router, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Razorpay from 'razorpay';
import Order from '../models/Order';
import Product from '../models/Product';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

let razorpayInstance: Razorpay | null = null;

function getRazorpay(): Razorpay {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }
  return razorpayInstance;
}

// POST /api/payments/create-order
// Validates cart server-side then creates a Razorpay order
router.post('/create-order', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { items, store } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Cart is empty' });
    return;
  }

  try {
    // Re-validate ALL prices against DB to prevent offline tampering
    let total = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findOne({ sku: item.sku });
      if (!product) {
        res.status(400).json({ error: `Product ${item.sku} not found` });
        return;
      }
      if (!product.stockAvailable) {
        res.status(400).json({ error: `${product.name} is out of stock` });
        return;
      }
      const lineTotal = product.price * item.quantity;
      total += lineTotal;
      validatedItems.push({
        sku: product.sku,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity: item.quantity,
        selectedVariant: item.selectedVariant,
        shop: product.shop,
        brand: product.shop,
        articleNo: product.articleNo,
        originalPrice: Math.round(product.price * 1.4),
      });
    }

    // Create Razorpay order
    const razorpayOrder = await getRazorpay().orders.create({
      amount: Math.round(total * 100), // in paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    });

    // Create pending order in DB
    const order = await Order.create({
      userId: req.userId,
      items: validatedItems,
      total,
      razorpayOrderId: razorpayOrder.id,
      store: store || 'ScanPay Store',
      paymentStatus: 'pending',
    });

    res.json({
      razorpayOrderId: razorpayOrder.id,
      orderId: order._id.toString(),
      total,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('create-order error:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// POST /api/payments/verify
// Verifies Razorpay signature and marks order as paid
router.post('/verify', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
    res.status(400).json({ error: 'Missing payment verification fields' });
    return;
  }

  // Verify signature
  const sign = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(sign)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    res.status(400).json({ error: 'Invalid payment signature' });
    return;
  }

  try {
    // Generate signed receipt QR payload (valid 2 hours for exit gate scan)
    const receiptPayload = jwt.sign(
      {
        orderId,
        razorpayPaymentId,
        userId: req.userId,
        ts: Date.now(),
      },
      process.env.RECEIPT_SECRET!,
      { expiresIn: '2h' }
    );

    // Update order as paid
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'paid',
      razorpayPaymentId,
      receiptQrPayload: receiptPayload,
      paymentMethod: 'Razorpay',
    });

    res.json({ success: true, receiptPayload });
  } catch (err) {
    console.error('verify error:', err);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// POST /api/payments/verify-receipt
// Used by exit gate scanner to validate a receipt QR
router.post('/verify-receipt', async (req: AuthRequest, res: Response): Promise<void> => {
  const { receiptPayload } = req.body;
  try {
    const decoded = jwt.verify(receiptPayload, process.env.RECEIPT_SECRET!) as any;
    const order = await Order.findById(decoded.orderId);
    if (!order || order.paymentStatus !== 'paid') {
      res.status(400).json({ valid: false, error: 'Order not paid' });
      return;
    }
    res.json({ valid: true, orderId: decoded.orderId, paidAt: decoded.ts });
  } catch {
    res.status(401).json({ valid: false, error: 'Invalid or expired receipt' });
  }
});

export default router;
