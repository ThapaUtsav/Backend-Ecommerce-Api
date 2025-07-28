import { z } from "zod";

export const orderCreationSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z
          .number()
          .int()
          .positive("Product ID must be a positive integer"),
        quantity: z
          .number()
          .int()
          .positive("Quantity must be a positive integer"),
      })
    )
    .nonempty("Order must contain at least one item"),
});
