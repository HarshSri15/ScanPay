import { db } from './database';
import { Product } from '../types';

interface ProductRow {
  sku: string;
  name: string;
  price: number;
  imageUrl: string;
  shop: string;
  variants: string;
  articleNo: string;
  stockAvailable: number;
  lastUpdatedAt: number;
}

const rowToProduct = (row: ProductRow): Product => ({
  sku: row.sku,
  name: row.name,
  price: row.price,
  imageUrl: row.imageUrl,
  shop: row.shop,
  variants: JSON.parse(row.variants),
  articleNo: row.articleNo,
  stockAvailable: row.stockAvailable === 1,
});

export const upsertProducts = (products: Product[]): void => {
  for (const p of products) {
    db.runSync(
      `INSERT OR REPLACE INTO products (sku, name, price, imageUrl, shop, variants, articleNo, stockAvailable, lastUpdatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.sku,
        p.name,
        p.price,
        p.imageUrl,
        p.shop,
        JSON.stringify(p.variants),
        p.articleNo,
        p.stockAvailable ? 1 : 0,
        Date.now(),
      ]
    );
  }
};

export const getAllProducts = (): Product[] => {
  const rows = db.getAllSync<ProductRow>(`SELECT * FROM products`);
  return rows.map(rowToProduct);
};

export const getProductBySku = (sku: string): Product | null => {
  const row = db.getFirstSync<ProductRow>(`SELECT * FROM products WHERE sku = ?`, [sku]);
  return row ? rowToProduct(row) : null;
};

export const getProductByArticleNo = (articleNo: string): Product | null => {
  const row = db.getFirstSync<ProductRow>(`SELECT * FROM products WHERE articleNo = ?`, [articleNo]);
  return row ? rowToProduct(row) : null;
};

export const getLastSyncTimestamp = (): number => {
  const row = db.getFirstSync<{ value: string }>(`SELECT value FROM sync_meta WHERE key = 'lastSync'`);
  return row ? parseInt(row.value, 10) : 0;
};

export const setLastSyncTimestamp = (ts: number): void => {
  db.runSync(`INSERT OR REPLACE INTO sync_meta (key, value) VALUES ('lastSync', ?)`, [ts.toString()]);
};
