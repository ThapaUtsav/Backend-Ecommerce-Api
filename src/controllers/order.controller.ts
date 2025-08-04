// controllers/orderController.ts
import { Request, Response } from "express";
import {
  orderSchema,
  updateOrderSchema,
} from "../validators/order.validation.js";
import * as OrderService from "../services/orderservices.js";
import {
  createOrderService,
  // updateOrderService,
  getOrdersByUser,
} from "../services/orderservices.js";
import { ZodError } from "zod";
import logger from "utils/logger.js";

//creation of order and linkage is done
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

    const order = await createOrderService(userId, result.data.items);
    return res.status(201).json(order);
  } catch (err) {
    console.error(err);
    if ((err as Error).name === "EntityNotFoundError") {
      return res.status(404).json({ error: "the product doesnt exist" });
    }
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

    const orders = await getOrdersByUser(userId);
    return res.json(orders);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Could not fetch orders" });
  }
};

//update order
export const updateOrder = async (req: Request, res: Response) => {
  const id = parseInt(req.params.order_id);
  const userid = parseInt(req.params.userId);
  const validation = updateOrderSchema.safeParse(req.body);

  if (!validation.success) {
    logger.error(
      `Validation failed on order update (ID: ${id}): ${JSON.stringify(
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
    const updatedOrder = await OrderService.updateOrderService(
      id,
      userid,
      validation.data
    );
    if (!updatedOrder) {
      logger.warn(`Order not found for update: ID ${id}`);
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(updatedOrder);
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`Error updating order ID ${id}: ${err.message}`, {
      error: err,
    });
    res.status(500).json({ message: "Error updating order" });
  }
};
