// validators/orderValidator.ts
import { z } from "zod";
export const orderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.number(),
        quantity: z
          .number()
          .min(1, { message: "Quantity must be atlease 1 or more" }),
      })
    )
    .nonempty({ message: "Order must have at least one item" }),
});

//admin confirm status change
export const updateOrderStatusSchema = z.object({
  status: z.enum(["Done", "Cancelled"]),
});

//update items for user
export const updateOrderItemSchema = z.object({
  status: z.enum(["Cancelled"]),
});
