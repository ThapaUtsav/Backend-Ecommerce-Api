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
  const imageFiles = req.files as Express.Multer.File[];
  //file name to imageFIlename VARTEX.png to VARTEX
  //if file.file.filedname give all the images name to image
  const imageFilenames = imageFiles?.map((file) => file.filename) || [];
  console.log("DEBUG FILE NAME:", imageFilenames);
  const bodyWithImages = {
    ...req.body,
    // price: req.body.price,
    // inventory: req.body.inventory,
    images: imageFilenames,
  };
  console.log("DEBUGG:", bodyWithImages);
  const validation = productCreationSchema.safeParse(bodyWithImages);

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

  console.log(validation.data);

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
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 5;
    const offset = (page - 1) * limit;

    const baseQuery = {
      ...req.query,
      limit,
      offset,
    };

    let productsWithCount;

    if (req.user?.role === "admin") {
      productsWithCount = await getAllProductsService(baseQuery);
    } else {
      const queryWithInventoryFilter = {
        ...baseQuery,
        minInventory: 1,
      };
      productsWithCount = await getAllProductsService(queryWithInventoryFilter);
    }

    const totalPages = Math.ceil(productsWithCount.total / limit);

    res.json({
      data: productsWithCount.data,
      pagination: {
        page,
        limit,
        total: productsWithCount.total,
        totalPages,
      },
    });
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
