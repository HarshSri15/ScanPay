import mongoose from 'mongoose';
import Product from './models/Product';
import dotenv from 'dotenv';

dotenv.config();

const PRODUCTS = [
  {
    sku: 'HM-87492',
    name: 'Striped Cotton T-Shirt',
    price: 899,
    imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=300',
    shop: 'H&M',
    variants: ['S', 'M', 'L', 'XL'],
    articleNo: '87492',
    barcodes: ['8714234567890', '4006381333931'],
    qrCodes: [],
    stockAvailable: true,
  },
  {
    sku: 'ZR-33821',
    name: 'Slim Fit Chinos',
    price: 1600,
    imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&q=80&w=300',
    shop: 'Zara',
    variants: ['30', '32', '34', '36'],
    articleNo: '33821',
    barcodes: ['8714234567891'],
    qrCodes: [],
    stockAvailable: true,
  },
  {
    sku: 'LV-55402',
    name: 'Denim Jacket',
    price: 2999,
    imageUrl: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab5?auto=format&fit=crop&q=80&w=300',
    shop: 'Levis',
    variants: ['S', 'M', 'L'],
    articleNo: '55402',
    barcodes: ['8714234567892'],
    qrCodes: [],
    stockAvailable: true,
  },
  {
    sku: 'UQ-11293',
    name: 'Basic White Tee',
    price: 499,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=300',
    shop: 'Uniqlo',
    variants: ['XS', 'S', 'M', 'L', 'XL'],
    articleNo: '11293',
    barcodes: ['8714234567893'],
    qrCodes: [],
    stockAvailable: true,
  },
  {
    sku: 'NK-99201',
    name: 'Running Shoes',
    price: 3499,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=300',
    shop: 'Nike',
    variants: ['7', '8', '9', '10', '11'],
    articleNo: '99201',
    barcodes: ['8714234567894'],
    qrCodes: [],
    stockAvailable: true,
  },
  {
    sku: 'SN-123456',
    name: 'Noise Cancelling Headphones',
    price: 5999,
    imageUrl: 'https://images.unsplash.com/photo-1612858250380-3206795f8a76?auto=format&fit=crop&q=80&w=300',
    shop: 'Sony',
    variants: ['One Size'],
    articleNo: '123456',
    barcodes: ['8714234567895'],
    qrCodes: [],
    stockAvailable: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('✅ Connected to MongoDB');

    await Product.deleteMany({});
    await Product.insertMany(PRODUCTS);

    console.log(`✅ Seeded ${PRODUCTS.length} products`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
