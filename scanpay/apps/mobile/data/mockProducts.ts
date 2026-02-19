import { Product } from '../types';

export const MOCK_PRODUCTS: Product[] = [
  {
    sku: 'HM-87492',
    name: 'Striped Cotton T-Shirt',
    price: 899,
    imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=400',
    shop: 'H&M',
    variants: ['S', 'M', 'L', 'XL'],
    articleNo: '87492',
    stockAvailable: true,
  },
  {
    sku: 'ZR-33821',
    name: 'Slim Fit Chinos',
    price: 1600,
    imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&q=80&w=400',
    shop: 'Zara',
    variants: ['30', '32', '34', '36'],
    articleNo: '33821',
    stockAvailable: true,
  },
  {
    sku: 'LV-55402',
    name: 'Denim Jacket',
    price: 2999,
    imageUrl: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab5?auto=format&fit=crop&q=80&w=400',
    shop: 'Levis',
    variants: ['S', 'M', 'L'],
    articleNo: '55402',
    stockAvailable: true,
  },
  {
    sku: 'UQ-11293',
    name: 'Basic White Tee',
    price: 499,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400',
    shop: 'Uniqlo',
    variants: ['XS', 'S', 'M', 'L', 'XL'],
    articleNo: '11293',
    stockAvailable: true,
  },
  {
    sku: 'NK-99201',
    name: 'Running Shoes',
    price: 3499,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400',
    shop: 'Nike',
    variants: ['7', '8', '9', '10', '11'],
    articleNo: '99201',
    stockAvailable: true,
  },
  {
    sku: 'SN-123456',
    name: 'Noise Cancelling Headphones',
    price: 5999,
    imageUrl: 'https://images.unsplash.com/photo-1612858250380-3206795f8a76?auto=format&fit=crop&q=80&w=400',
    shop: 'Sony',
    variants: ['One Size'],
    articleNo: '123456',
    stockAvailable: true,
  },
];

export const findMockProductByBarcode = (scanned: string): Product | null => {
  const s = scanned.trim();
  return MOCK_PRODUCTS.find(p => p.articleNo === s || p.sku === s) ?? null;
};

export const findMockProductByArticleNo = (articleNo: string): Product | null => {
  return MOCK_PRODUCTS.find(p => p.articleNo === articleNo.trim()) ?? null;
};