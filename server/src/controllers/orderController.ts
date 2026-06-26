import { Request, Response } from "express";
import { Order } from "../models/Order.js";
import { Shop } from "../models/Shop.js";
import { AuthRequest } from "../middleware/auth.js";

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { shopId, products, deliveryAddress, area, paymentMethod, notes } =
      req.body;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    let totalAmount = 0;
    const orderProducts = products.map((p: any) => {
      totalAmount += p.price * p.quantity;
      return {
        productId: p.productId,
        name: p.name,
        price: p.price,
        quantity: p.quantity,
      };
    });

    const commissionAmount = totalAmount * (shop.commissionRate / 100);

    const order = await Order.create({
      customerId: req.user?.id,
      shopId,
      products: orderProducts,
      totalAmount,
      commissionAmount,
      deliveryAddress,
      area,
      paymentMethod: paymentMethod || "cod",
      notes,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find({ customerId: req.user?.id })
      .populate("shopId", "name area city")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getSellerOrders = async (req: AuthRequest, res: Response) => {
  try {
    const shop = await Shop.findOne({ sellerId: req.user?.id });
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    const orders = await Order.find({ shopId: shop._id })
      .populate("customerId", "name email phone")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const shop = await Shop.findOne({ sellerId: req.user?.id });
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, shopId: shop._id },
      { status },
      { new: true },
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("shopId")
      .populate("customerId", "name email phone");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
