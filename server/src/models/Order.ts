import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  customerId: mongoose.Types.ObjectId;
  shopId: mongoose.Types.ObjectId;
  products: Array<{
    productId: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  commissionAmount: number;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  paymentMethod: "cod" | "jazzcash" | "easypaisa" | "bank_transfer";
  paymentStatus: "pending" | "paid" | "failed";
  deliveryAddress: string;
  area: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    shopId: { type: Schema.Types.ObjectId, ref: "Shop", required: true },
    products: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product" },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    commissionAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "jazzcash", "easypaisa", "bank_transfer"],
      default: "cod",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    deliveryAddress: { type: String, required: true },
    area: { type: String, required: true },
    notes: { type: String },
  },
  { timestamps: true },
);

export const Order = mongoose.model<IOrder>("Order", orderSchema);
