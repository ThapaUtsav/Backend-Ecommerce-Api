// controllers/orderController.ts
import { Request, Response } from "express";
import {
  orderSchema,
  updateOrderSchema,
} from "../validators/order.validation.js";
// import * as OrderService from "../services/orderservices.js";
import {
  createOrderService,
  updateOrderService,
  getOrdersByUser,
  deleteOrderItemService,
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

// update order
export const updateOrderItems = async (req: Request, res: Response) => {
  const userID = req.user?.id;
  const orderId = parseInt(req.params.order_id);
  const parsed = updateOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation Errors",
      errors: parsed.error.issues,
    });
  }
  try {
    const updatedOrder = await updateOrderService(
      userID,
      orderId,
      parsed.data.items || []
    );
    return res.json(updatedOrder);
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
};

//delete order
export const deleteOrderItem = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const orderId = parseInt(req.params.order_id);
  const itemId = parseInt(req.params.item_id);

  try {
    const success = await deleteOrderItemService(userId, orderId, itemId);

    if (!success) {
      return res
        .status(404)
        .json({ message: "Order item not found or unauthorized" });
    }
    //deletion shows no content or error s
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete order item" });
  }
};
