import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  sku: string;
  name: string;
  price: number;
  imageUrl: string;
  shop: string;
  variants: string[];
  articleNo: string;
  barcodes: string[];
  qrCodes: string[];
  stockAvailable: boolean;
  lastUpdatedAt: Date;
}

const productSchema = new Schema<IProduct>({
  sku: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, default: '' },
  shop: { type: String, required: true },
  variants: [{ type: String }],
  articleNo: { type: String, index: true },
  barcodes: [{ type: String }],
  qrCodes: [{ type: String }],
  stockAvailable: { type: Boolean, default: true },
  lastUpdatedAt: { type: Date, default: Date.now },
});

// Index for fast barcode lookups
productSchema.index({ barcodes: 1 });
productSchema.index({ qrCodes: 1 });
productSchema.index({ articleNo: 1 });

export default mongoose.model<IProduct>('Product', productSchema);
