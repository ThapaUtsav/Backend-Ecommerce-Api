import { Request, Response } from "express";
import { Product } from "../models/Product.js";
import { AppDataSource } from "config/.ormconfig.js";
import logger from "../utils/logger.js";
import {
  productCreationSchema,
  productSchema,
} from "../validators/product.validation.js";

const productRepo = AppDataSource.getRepository(Product);

// PRODUCT CREATION
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

// GET ALL PRODUCTS + FILTERING
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const query = req.query;
    const qb = productRepo.createQueryBuilder("product");

    // FILTERS
    Object.entries(query).forEach(([key, value]) => {
      if (typeof value !== "string") return;
      const cleanValue = value.trim();

      const match = key.match(/(price|inventory)_(gt|lt)/);
      if (match) {
        const [, field, operator] = match;
        const dbOpMap: Record<string, string> = {
          gt: ">",
          lt: "<",
        };
        qb.andWhere(`product.${field} ${dbOpMap[operator]} :${key}`, {
          [key]: Number(cleanValue),
        });
      }

      // Partial matches
      if (["name", "category", "brand", "color"].includes(key)) {
        qb.andWhere(`LOWER(product.${key}) LIKE LOWER(:${key})`, {
          [key]: `%${cleanValue}%`,
        });
      }
    });

    // SORTING
    if (typeof query.sort === "string") {
      const [field, dirRaw] = query.sort.split("_");
      const direction = dirRaw.toLowerCase();

      if (
        ["price", "inventory", "size"].includes(field) &&
        ["asc", "desc"].includes(direction)
      ) {
        qb.orderBy(
          `product.${field}`,
          direction.toUpperCase() as "ASC" | "DESC"
        );
      }
    }

    console.log("Generated SQL:", qb.getSql());

    const products = await qb.getMany();
    res.json(products);
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

// DELETE PRODUCT
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
