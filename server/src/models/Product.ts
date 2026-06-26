import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  shopId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  category: string;
  price: number;
  originalPrice?: number;
  stock: number;
  images: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    shopId: { type: Schema.Types.ObjectId, ref: "Shop", required: true },
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    stock: { type: Number, default: 0 },
    images: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Product = mongoose.model<IProduct>("Product", productSchema);
