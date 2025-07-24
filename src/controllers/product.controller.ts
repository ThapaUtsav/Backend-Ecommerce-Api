import { Request, Response } from "express";
import { Product } from "../models/Product.js";
import { AppDataSource } from "config/.ormconfig.js";
import logger from "../utils/logger.js";
import {
  productCreationSchema,
  productSchema,
} from "../validators/product.validation.js";

const productRepo = AppDataSource.getRepository(Product);

//product creation part(Validation,Logging)
export const createProduct = async (req: Request, res: Response) => {
  const validation = productCreationSchema.safeParse(req.body);

  if (!validation.success) {
    logger.error(
      `Validation failed on product creation: ${JSON.stringify(req.body)}`,
      validation.error
    );
    return res.status(400).json({
      message: "Validation error",
      errors: validation.error,
    });
  }

  try {
    const newProduct = productRepo.create(validation.data);
    const savedProduct = await productRepo.save(newProduct);
    res.status(201).json(savedProduct);
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`Error creating product: ${err.message}`, { error: err });
    res.status(500).json({ message: "Error creating product" });
  }
};

//Search all products(VALidation and logging)
export const getAllProducts = async (_req: Request, res: Response) => {
  try {
    const products = await productRepo.find();
    res.json(products);
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("Error fetching products", { error: err });
    res.status(500).json({ message: "Error fetching products" });
  }
};

//search by product ID(might change,validation adn loggin)
export const getProductById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    const product = await productRepo.findOne({ where: { id } });
    if (!product) {
      logger.warn(`Product not found: ID ${id}`);
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`Error fetching product ID ${id}`, { error: err });
    res.status(500).json({ message: "Error fetching product" });
  }
};

//update of product and then (validation and loggin)
export const updateProduct = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const validation = productSchema.safeParse(req.body);
  if (!validation.success) {
    logger.error(
      `Validation failed on product update (ID: ${id}): ${JSON.stringify(
        req.body
      )}`,
      validation.error
    );
    //error shows in logs\error.log
    return res.status(400).json({
      message: "Validation error",
      errors: validation.error,
    });
  }

  try {
    const product = await productRepo.findOne({ where: { id } });
    if (!product) {
      logger.warn(`Product not found for update: ID ${id}`);
      return res.status(404).json({ message: "Product not found" });
    }

    productRepo.merge(product, validation.data);
    const updatedProduct = await productRepo.save(product);
    res.json(updatedProduct);
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`Error updating product ID ${id}: ${err.message}`, {
      error: err,
    });
    res.status(500).json({ message: "Error updating product" });
  }
};
//Deletion of product(loggin and validation inside)
export const deleteProduct = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    const product = await productRepo.findOne({ where: { id } });
    if (!product) {
      logger.warn(`Product not found for deletion: ID ${id}`);
      return res.status(404).json({ message: "Product not found" });
    }

    await productRepo.remove(product);
    res.status(200).json({ message: "Product deleted", product });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`Error deleting product ID ${id}: ${err.message}`, {
      error: err,
    });
    res.status(500).json({ message: "Error deleting product" });
  }
};
