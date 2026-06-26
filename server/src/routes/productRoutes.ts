import { Router } from "express";
import {
  createProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
} from "../controllers/productController.js";
import { protect, sellerOnly } from "../middleware/auth.js";

const router = Router();

router.post("/", protect, sellerOnly, createProduct);
router.get("/my", protect, sellerOnly, getMyProducts);
router.put("/:id", protect, sellerOnly, updateProduct);
router.delete("/:id", protect, sellerOnly, deleteProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);

export default router;
