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
        .nonnegative("Stock must be a non-negative integer")
        .min(1),
    images: z.array(z.string()).optional(),
    color: z.string().min(3),
    size: z.string().optional(),
    brand: z.string().optional(),
});
//updateschema
export const productSchema = z.object({
    name: z.string().min(1),
    price: z.number().positive(),
    description: z.string().optional(),
    inventory: z.number().int().nonnegative(),
    color: z.string().min(3),
    size: z.string().optional(),
    brand: z.string().optional(),
});
