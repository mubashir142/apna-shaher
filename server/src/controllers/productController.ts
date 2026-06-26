import { Request, Response } from "express";
import { Product } from "../models/Product.js";
import { AuthRequest } from "../middleware/auth.js";

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, category, price, originalPrice, stock, images } =
      req.body;

    const shop = await (
      await import("../models/Shop.js")
    ).Shop.findOne({ sellerId: req.user?.id });
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    const product = await Product.create({
      shopId: shop._id,
      name,
      description,
      category,
      price,
      originalPrice,
      stock,
      images: images || [],
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getMyProducts = async (req: AuthRequest, res: Response) => {
  try {
    const shop = await (
      await import("../models/Shop.js")
    ).Shop.findOne({ sellerId: req.user?.id });
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    const products = await Product.find({ shopId: shop._id });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const shop = await (
      await import("../models/Shop.js")
    ).Shop.findOne({ sellerId: req.user?.id });
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, shopId: shop._id },
      req.body,
      { new: true, runValidators: true },
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const shop = await (
      await import("../models/Shop.js")
    ).Shop.findOne({ sellerId: req.user?.id });
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      shopId: shop._id,
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { category, area, city, search, shopId } = req.query;
    const filter: any = { isActive: true };

    if (category) filter.category = category;
    if (shopId) filter.shopId = shopId;

    let products = await Product.find(filter).populate({
      path: "shopId",
      match:
        city || area
          ? {
              ...(city && { city: city as string }),
              ...(area && { area: area as string }),
            }
          : undefined,
    });

    // When populate uses match, non-matching docs get shopId = null — filter them out
    if (city || area) {
      products = products.filter((p) => p.shopId !== null);
    }

    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      products = products.filter(
        (p) => searchRegex.test(p.name) || searchRegex.test(p.description ?? ""),
      );
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).populate("shopId");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
