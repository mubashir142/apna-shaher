import mongoose, { Schema, Document } from "mongoose";

export interface IShop extends Document {
  sellerId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  logo?: string;
  banner?: string;
  address: string;
  area: string;
  city: "Islamabad" | "Rawalpindi";
  phone: string;
  isVerified: boolean;
  commissionRate: number;
  createdAt: Date;
  updatedAt: Date;
}

const shopSchema = new Schema<IShop>(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: { type: String },
    logo: { type: String },
    banner: { type: String },
    address: { type: String, required: true },
    area: { type: String, required: true },
    city: { type: String, enum: ["Islamabad", "Rawalpindi"], required: true },
    phone: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    commissionRate: { type: Number, default: 5 },
  },
  { timestamps: true },
);

export const Shop = mongoose.model<IShop>("Shop", shopSchema);
