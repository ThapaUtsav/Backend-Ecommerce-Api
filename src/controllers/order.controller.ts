// controllers/orderController.ts
import { Request, Response } from "express";
import { orderSchema } from "../validators/order.validation.js";
// import * as OrderService from "../services/orderservices.js";
import {
  createOrderService,
  getOrdersByUser,
  updateAllOrderItemsStatus,
  updateOrderItemStatus,
} from "../services/orderservices.js";
import { ZodError } from "zod";
import logger from "utils/logger.js";
import { AppDataSource } from "config/.ormconfig.js";
import { Order } from "models/Order.js";

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
      logger.error("unauthorzied user found");
      return res.status(401).json({ error: "Unauthorized: No user ID found" });
    }

    const order = await createOrderService(userId, result.data.items);
    return res.status(201).json(order);
  } catch (err) {
    console.error(err);
    if ((err as Error).name === "EntityNotFoundError") {
      return res.status(404).json({ error: "the product doesn't exist" });
    }
    if (err instanceof ZodError) {
      return res.status(400).json({ error: err.issues });
    }
    return res.status(500).json({ error: "Could not create order" });
  }
};

export const getAllOrders = async () => {
  const orderRepo = AppDataSource.getRepository(Order);
  return await orderRepo.find({
    relations: ["user", "items", "items.product"],
  });
};

//view history of user products
export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      logger.error("Unauthorized user found");
      return res.status(401).json({ error: "Unauthorized: No user ID found" });
    }

    let orders;

    // If user is an admin, fetch all orders
    if (userRole === "admin") {
      console.log("Admin fetching all orders");
      orders = await getAllOrders(); // you need to implement this function
    } else {
      console.log("User fetching own orders");
      orders = await getOrdersByUser(userId);
    }

    return res.json(orders);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Could not fetch orders" });
  }
};

//update on admin side to change order to DONE OR CANCEL ONLY
export const updateOrderStatusController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const isAdmin = req.user?.role === "admin";
    const orderId = parseInt(req.params.orderId);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }

    const { status } = req.body;

    const result = await updateAllOrderItemsStatus(
      userId,
      orderId,
      status,
      isAdmin
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

//user change status on pending to cancel
export const updateOrderItemStatusController = async (
  req: Request,
  res: Response
) => {
  try {
    // Explicit parsing with error handling
    const itemId = parseInt(req.params.itemId, 10);

    // Add validation for itemId
    if (isNaN(itemId)) {
      return res.status(400).json({
        error: "Invalid item ID. Must be a valid integer.",
      });
    }

    const userId = req.user?.id;
    const isAdmin = req.user?.role === "admin";
    const { status } = req.body;

    // Optional: Validate status
    if (!status) {
      return res.status(400).json({
        error: "Status is required",
      });
    }

    const updatedItem = await updateOrderItemStatus(
      userId,
      itemId,
      status,
      isAdmin
    );

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error("Update Order Item Status Error:", error);
    res.status(400).json({ error: (error as Error).message });
  }
};
