import { Router } from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import { Shop } from "../models/Shop.js";
import { Order } from "../models/Order.js";
import { User } from "../models/User.js";
import { Product } from "../models/Product.js";
import { AuthRequest } from "../middleware/auth.js";
import { Response } from "express";

const router = Router();
router.use(protect, adminOnly);

router.get("/stats", async (_req, res: Response) => {
  try {
    const [totalShops, verifiedShops, totalOrders, totalUsers, totalProducts, orders] =
      await Promise.all([
        Shop.countDocuments(),
        Shop.countDocuments({ isVerified: true }),
        Order.countDocuments(),
        User.countDocuments(),
        Product.countDocuments(),
        Order.find().select("totalAmount commissionAmount status"),
      ]);

    const totalRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);
    const totalCommission = orders.reduce((s, o) => s + o.commissionAmount, 0);

    res.json({ totalShops, verifiedShops, totalOrders, totalUsers, totalProducts, totalRevenue, totalCommission });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

router.get("/shops", async (_req, res: Response) => {
  try {
    const shops = await Shop.find().populate("sellerId", "name email phone").sort({ createdAt: -1 });
    res.json(shops);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

router.put("/shops/:id/verify", async (req: AuthRequest, res: Response) => {
  try {
    const { isVerified } = req.body;
    const shop = await Shop.findByIdAndUpdate(
      req.params.id,
      { isVerified: isVerified ?? true },
      { new: true },
    );
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    res.json(shop);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

router.put("/shops/:id/commission", async (req: AuthRequest, res: Response) => {
  try {
    const { commissionRate } = req.body;
    const shop = await Shop.findByIdAndUpdate(
      req.params.id,
      { commissionRate },
      { new: true },
    );
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    res.json(shop);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

router.get("/orders", async (_req, res: Response) => {
  try {
    const orders = await Order.find()
      .populate("shopId", "name area city")
      .populate("customerId", "name email")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

export default router;
