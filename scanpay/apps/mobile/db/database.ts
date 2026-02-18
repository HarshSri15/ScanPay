import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('scanpay.db');

export const initDB = (): void => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS products (
      sku TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      imageUrl TEXT DEFAULT '',
      shop TEXT NOT NULL,
      variants TEXT NOT NULL,
      articleNo TEXT,
      stockAvailable INTEGER DEFAULT 1,
      lastUpdatedAt INTEGER
    );

    CREATE TABLE IF NOT EXISTS cart (
      id TEXT PRIMARY KEY,
      sku TEXT NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      imageUrl TEXT DEFAULT '',
      quantity INTEGER NOT NULL DEFAULT 1,
      selectedVariant TEXT NOT NULL,
      shop TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sync_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
};
