import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getSellerOrders,
  updateOrderStatus,
  getOrderById,
} from "../controllers/orderController.js";
import { protect, sellerOnly } from "../middleware/auth.js";

const router = Router();

router.post("/", protect, createOrder);
router.get("/my", protect, getMyOrders);
router.get("/seller", protect, sellerOnly, getSellerOrders);
router.put("/:id/status", protect, sellerOnly, updateOrderStatus);
router.get("/:id", protect, getOrderById);

export default router;
