// controllers/orderController.ts
import { Request, Response } from "express";
import { orderSchema } from "../validators/order.validation.js"; // Ensure this path is correct
import * as OrderService from "../services/orderservices.js";
import { ZodError } from "zod";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const result = orderSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: No user ID found" });
    }

    const order = await OrderService.createOrder(userId, result.data.items);
    return res.status(201).json(order);
  } catch (err) {
    console.error(err);
    if (err instanceof ZodError) {
      return res.status(400).json({ error: err.issues });
    }
    return res.status(500).json({ error: "Could not create order" });
  }
};

//view history of user products
export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: No user ID found" });
    }

    const orders = await OrderService.getOrdersByUser(userId);
    return res.json(orders);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Could not fetch orders" });
  }
};
