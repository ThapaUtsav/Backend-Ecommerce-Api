// validators/orderValidator.ts
import { z } from "zod";

export const orderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.number().int(),
      quantity: z.number().int().positive().max(10),
    })
  ),
});

export const updateOrderSchema = z
  .object({
    total: z.number().positive().optional(),
  })
  .strict();
