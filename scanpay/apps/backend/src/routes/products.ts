import { Router, Request, Response } from 'express';
import Product from '../models/Product';

const router = Router();

// GET /api/products/catalog?since=<timestamp>
// Returns full catalog or delta since last sync
router.get('/catalog', async (req: Request, res: Response): Promise<void> => {
  try {
    const since = req.query.since ? new Date(Number(req.query.since)) : new Date(0);
    const products = await Product.find({ lastUpdatedAt: { $gte: since } }).lean();
    res.json({ products, syncedAt: Date.now() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch catalog' });
  }
});

// GET /api/products/lookup?barcode=xxx OR ?articleNo=xxx OR ?qr=xxx
// Used as fallback if product not in local SQLite cache
router.get('/lookup', async (req: Request, res: Response): Promise<void> => {
  const { barcode, articleNo, qr, sku } = req.query as Record<string, string>;

  try {
    let product = null;

    if (barcode) {
      product = await Product.findOne({ barcodes: barcode }).lean();
    } else if (qr) {
      product = await Product.findOne({ qrCodes: qr }).lean();
    } else if (articleNo) {
      product = await Product.findOne({ articleNo }).lean();
    } else if (sku) {
      product = await Product.findOne({ sku }).lean();
    }

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json({ product });
  } catch (err) {
    res.status(500).json({ error: 'Lookup failed' });
  }
});

// GET /api/products — list all (admin use)
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const products = await Product.find().lean();
  res.json({ products });
});

export default router;
