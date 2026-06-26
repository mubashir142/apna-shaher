import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "customer" | "seller" | "admin";
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["customer", "seller", "admin"],
      default: "customer",
    },
    phone: { type: String },
  },
  { timestamps: true },
);

export const User = mongoose.model<IUser>("User", userSchema);
