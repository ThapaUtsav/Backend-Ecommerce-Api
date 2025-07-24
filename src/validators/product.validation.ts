import { z } from "zod";

export const productCreationSchema = z.object({
  name: z.string().nonempty("Product name is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be a positive number"),
  category: z.string().optional(),
  inventory: z
    .number()
    .int()
    .nonnegative("Stock must be a non-negative integer"),
  images: z.array(z.url()).optional(),
});

export const productSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  description: z.string().optional(),
  inventory: z.number().int().nonnegative(),
});
