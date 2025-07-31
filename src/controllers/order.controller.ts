// controllers/order.controller.ts
import { Request, Response } from "express";
import { createOrder } from "services/orderservices.js";

export const createOrderHandler = async (req: Request, res: Response) => {
  try {
    const { userId, items } = req.body;

    if (!userId || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const order = await createOrder(userId, items);
    return res.status(201).json(order);
  } catch (err) {
    console.error("Order creation error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};
