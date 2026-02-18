import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
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

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  total: number;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  receiptQrPayload?: string;
  store: string;
  storeAddress?: string;
  storePhone?: string;
  paymentMethod?: string;
  createdAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  sku: String,
  name: String,
  price: Number,
  imageUrl: { type: String, default: '' },
  quantity: Number,
  selectedVariant: String,
  shop: String,
  brand: String,
  articleNo: String,
  originalPrice: Number,
});

const orderSchema = new Schema<IOrder>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  total: Number,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  receiptQrPayload: String,
  store: String,
  storeAddress: String,
  storePhone: String,
  paymentMethod: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IOrder>('Order', orderSchema);
