import { z } from "zod";

export const productCreationSchema = z.object({
  name: z.string().nonempty("Product name is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be a positive number"),
  category: z.string().optional(),
  stock: z.number().int().nonnegative("Stock must be a non-negative integer"),
  images: z.array(z.url()).optional(),
});
