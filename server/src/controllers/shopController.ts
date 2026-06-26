import { Request, Response } from "express";
import { Shop } from "../models/Shop.js";
import { AuthRequest } from "../middleware/auth.js";

export const createShop = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, address, area, city, phone } = req.body;

    const shop = await Shop.create({
      sellerId: req.user?.id,
      name,
      description,
      address,
      area,
      city,
      phone,
    });

    res.status(201).json(shop);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getMyShop = async (req: AuthRequest, res: Response) => {
  try {
    const shop = await Shop.findOne({ sellerId: req.user?.id });
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }
    res.json(shop);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateShop = async (req: AuthRequest, res: Response) => {
  try {
    const shop = await Shop.findOneAndUpdate(
      { sellerId: req.user?.id },
      req.body,
      { new: true, runValidators: true },
    );
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }
    res.json(shop);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getAllShops = async (req: Request, res: Response) => {
  try {
    const { area, city, verified } = req.query;
    const filter: any = {};

    if (area) filter.area = area;
    if (city) filter.city = city;
    if (verified !== undefined) filter.isVerified = verified === "true";

    const shops = await Shop.find(filter).populate("sellerId", "name email");
    res.json(shops);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getShopById = async (req: Request, res: Response) => {
  try {
    const shop = await Shop.findById(req.params.id).populate(
      "sellerId",
      "name email phone",
    );
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }
    res.json(shop);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const verifyShop = async (req: AuthRequest, res: Response) => {
  try {
    const shop = await Shop.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true },
    );
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }
    res.json(shop);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
