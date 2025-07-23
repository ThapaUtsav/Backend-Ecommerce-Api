// src/controllers/product.controller.ts
import { Request, Response } from "express";
import { Product } from "../models/Product.js";
import { AppDataSource } from "config/.ormconfig.js";

// Get repository (the correct way in TypeORM v0.3+)
const productRepo = AppDataSource.getRepository(Product);

export const createProduct = async (req: Request, res: Response) => {
  const { name, price, description, stock } = req.body;

  try {
    const newProduct = productRepo.create({ name, price, description, stock });
    const savedProduct = await productRepo.save(newProduct);
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: "Error creating product", error });
  }
};

export const getAllProducts = async (_req: Request, res: Response) => {
  try {
    const products = await productRepo.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  try {
    const product = await productRepo.findOneBy({ id });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  try {
    const product = await productRepo.findOneBy({ id });
    if (!product) return res.status(404).json({ message: "Product not found" });

    productRepo.merge(product, req.body);
    const updatedProduct = await productRepo.save(product);
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  try {
    const product = await productRepo.findOneBy({ id });
    if (!product) return res.status(404).json({ message: "Product not found" });

    await productRepo.remove(product);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error });
  }
};
