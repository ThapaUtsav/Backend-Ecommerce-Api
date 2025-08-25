//product validation
import { z } from "zod";

export const productCreationSchema = z.object({
  name: z.string().nonempty("Product name is required"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Price must be a positive number"),
  category: z.string().optional(),
  inventory: z.coerce
    .number()
    .int()
    .nonnegative("Stock must be a non-negative integer"),
  images: z.array(z.string()).optional(),
  color: z.string(),
  size: z.string().optional(),
  brand: z.string().optional(),
});
//updateschema this makes it so that in update not everything is required to update the system
export const productupdateSchema = z.object({
  name: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  description: z.string().optional(),
  inventory: z.number().int().nonnegative().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  brand: z.string().optional(),
  delete: z.literal(false).optional(),
});

export const productdeleteschema = z.object({
  deletion_status_product: z.literal(false),
});
