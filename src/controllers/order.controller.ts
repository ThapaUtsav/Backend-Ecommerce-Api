// controllers/orderController.ts
import { Request, Response } from "express";
import {
  orderSchema,
  updateOrderItemSchema,
  updateOrderStatusSchema,
} from "../validators/order.validation.js";
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
    if (err) {
      return res
        .status(400)
        .json({ error: "Validation error cause while creation" });
    }
    return res.status(500).json({ error: "Could not create order" });
  }
};

export const getAllOrders = async (limit?: number, offset?: number) => {
  const orderRepo = AppDataSource.getRepository(Order);

  const qb = orderRepo
    .createQueryBuilder("order")
    .leftJoinAndSelect("order.items", "items")
    .leftJoinAndSelect("items.product", "product")
    .leftJoinAndSelect("order.user", "user")
    .orderBy("order.created_at", "DESC");

  const total = await qb.getCount();

  if (limit !== undefined) qb.take(limit);
  if (offset !== undefined) qb.skip(offset);

  const data = await qb.getMany();

  return { data, total };
};

//view history of user products
export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 2;
    const offset = (page - 1) * limit;

    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      logger.error("Unauthorized user found");
      return res.status(401).json({ error: "Unauthorized: No user ID found" });
    }

    let result;

    if (userRole === "admin") {
      result = await getAllOrders(limit, offset);
    } else {
      result = await getOrdersByUser(userId, limit, offset);
    }
    return res.json({
      data: result.data,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
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
    // Early validation checks
    const userId = req.user?.id;
    const isAdmin = req.user?.role === "admin";
    const orderId = parseInt(req.params.orderId);

    // Validate order ID first
    if (isNaN(orderId)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }

    // Validate request body
    const validationResult = updateOrderStatusSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation error in status update",
        errors: validationResult.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const { status } = req.body;

    logger.info("Order status update attempt", {
      orderId,
      newStatus: status,
      userId,
      isAdmin,
    });

    try {
      const result = await updateAllOrderItemsStatus(
        userId,
        orderId,
        status,
        isAdmin
      );

      // Successful update logging
      logger.info("Order status updated successfully", {
        orderId,
        newStatus: status,
        revertedItems: result.revertedItems,
      });

      return res.status(200).json({
        message: result.message,
        revertedItems: result.revertedItems,
      });
    } catch (serviceError) {
      if (serviceError instanceof Error) {
        const errorMap: Record<string, { status: number; message: string }> = {
          "Order not found": {
            status: 404,
            message: "Order not found",
          },
          "Unauthorized:Only admin can mark DONE": {
            status: 403,
            message: "Only administrator can mark order as DONE",
          },
          "Unauthorzied:Cannot update this order": {
            status: 403,
            message: "You are not authorized to update this order",
          },
        };

        const mappedError = errorMap[serviceError.message];
        if (mappedError) {
          return res
            .status(mappedError.status)
            .json({ error: mappedError.message });
        }
        logger.error("Unexpected order status update error", {
          error: serviceError,
          orderId,
          userId,
        });

        return res.status(500).json({
          error:
            "An unexpected error occurred.Only Admin is allwoed to do DONE",
        });
      }

      return res.status(500).json({ error: "Could not update order status" });
    }
  } catch (error) {
    logger.error("Unhandled error in updateOrderStatusController", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

//user change status on pending to cancel
export const updateOrderItemStatusController = async (
  req: Request,
  res: Response
) => {
  try {
    const itemId = parseInt(req.params.itemId, 10);
    const validationResultUserItem = updateOrderItemSchema.safeParse(req.body);

    if (!validationResultUserItem.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: validationResultUserItem.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }
    // Add validation for itemId
    if (isNaN(itemId)) {
      return res.status(400).json({
        error: "Invalid item ID. Must be a valid integer.",
      });
    }

    const userId = req.user?.id;
    const isAdmin = req.user?.role === "admin";
    const { status } = req.body;
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
