import { Router } from "express";
import {
  createShop,
  getMyShop,
  updateShop,
  getAllShops,
  getShopById,
  verifyShop,
} from "../controllers/shopController.js";
import { protect, sellerOnly, adminOnly } from "../middleware/auth.js";

const router = Router();

router.post("/", protect, sellerOnly, createShop);
router.get("/my", protect, sellerOnly, getMyShop);
router.put("/my", protect, sellerOnly, updateShop);
router.get("/", getAllShops);
router.get("/:id", getShopById);
router.put("/:id/verify", protect, adminOnly, verifyShop);

export default router;
