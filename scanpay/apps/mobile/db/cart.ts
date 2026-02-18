import { db } from './database';
import { CartItem } from '../types';

export const loadCart = (): CartItem[] => {
  const rows = db.getAllSync<CartItem>(`SELECT * FROM cart`);
  return rows;
};

export const addOrUpdateCartItem = (item: Omit<CartItem, 'id'>, id: string): void => {
  const existing = db.getFirstSync<{ id: string; quantity: number }>(
    `SELECT id, quantity FROM cart WHERE sku = ? AND selectedVariant = ?`,
    [item.sku, item.selectedVariant]
  );

  if (existing) {
    db.runSync(
      `UPDATE cart SET quantity = quantity + 1 WHERE sku = ? AND selectedVariant = ?`,
      [item.sku, item.selectedVariant]
    );
  } else {
    db.runSync(
      `INSERT INTO cart (id, sku, name, price, imageUrl, quantity, selectedVariant, shop)
       VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
      [id, item.sku, item.name, item.price, item.imageUrl, item.selectedVariant, item.shop]
    );
  }
};

export const updateCartItemQty = (id: string, quantity: number): void => {
  db.runSync(`UPDATE cart SET quantity = ? WHERE id = ?`, [quantity, id]);
};

export const removeCartItemById = (id: string): void => {
  db.runSync(`DELETE FROM cart WHERE id = ?`, [id]);
};

export const clearAllCart = (): void => {
  db.runSync(`DELETE FROM cart`);
};
