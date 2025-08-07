import { Request, Response } from "express";
import logger from "../utils/logger.js";
import {
  productCreationSchema,
  productSchema,
} from "../validators/product.validation.js";

import {
  createProductService,
  getAllProductsService,
  getProductByIdService,
  updateProductService,
  deleteProductService,
} from "../services/productservices.js";

// CREATE PRODUCT
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
    const savedProduct = await createProductService(validation.data);
    res.status(201).json(savedProduct);
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`Error creating product: ${err.message}`, { error: err });
    res.status(500).json({ message: "Error creating product" });
  }
};

// GET ALL PRODUCTS
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const queryWithInventoryFilter = {
      ...req.query,
      minInventory: 1,
    };
    const products = await getAllProductsService(queryWithInventoryFilter);
    const filteredProducts = products.filter(
      (product) => product.inventory > 0
    );
    res.json(filteredProducts);
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("Error fetching products", { error: err });
    return res.status(500).json({ message: "Error fetching products" });
  }
};

// GET PRODUCT BY ID
export const getProductById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  try {
    const product = await getProductByIdService(id);
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

// UPDATE PRODUCT
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
    return res.status(400).json({
      message: "Validation error",
      errors: validation.error,
    });
  }

  try {
    const updatedProduct = await updateProductService(id, validation.data);
    if (!updatedProduct) {
      logger.warn(`Product not found for update: ID ${id}`);
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(updatedProduct);
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`Error updating product ID ${id}: ${err.message}`, {
      error: err,
    });
    res.status(500).json({ message: "Error updating product" });
  }
};

// DELETE PRODUCT
export const deleteProduct = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    const deletedProduct = await deleteProductService(id);
    if (!deletedProduct) {
      logger.warn(`Product not found for deletion: ID ${id}`);
      return res.status(404).json({ message: "Product not found" });
    }
    res
      .status(200)
      .json({ message: "Product deleted", product: deletedProduct });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`Error deleting product ID ${id}: ${err.message}`, {
      error: err,
    });
    res.status(500).json({ message: "Error deleting product" });
  }
};
