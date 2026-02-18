export interface Product {
  sku: string;
  name: string;
  price: number;
  imageUrl: string;
  shop: string;
  variants: string[];
  articleNo: string;
  stockAvailable: boolean;
}

export interface CartItem {
  id: string;           // local SQLite row id
  sku: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  selectedVariant: string;
  shop: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  total: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  store: string;
  storeAddress?: string;
  storePhone?: string;
  paymentMethod?: string;
  receiptQrPayload?: string;
  razorpayPaymentId?: string;
  createdAt: string;
}

export interface OrderItem {
  sku: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  selectedVariant: string;
  shop: string;
  brand: string;
  articleNo: string;
  originalPrice?: number;
}
