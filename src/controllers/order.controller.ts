import { Request, Response } from "express";
import * as orderService from "../services/orderservices.js";
import logger from "../utils/logger.js";
//creation of order
export const createOrder = async (req: Request, res: Response) => {
  const { productId, quantity } = req.body;
  const userId = req.user?.id;
  const order = await orderService.createOrder(userId, productId, quantity);
  res.status(201).json(order);
};
//order syncs to get history,mainly user history to chekc themselves and see admin who requested the orderx
export const getOrders = async (_req: Request, res: Response) => {
  const orders = await orderService.getAllOrders();
  res.json(orders);
};
//Order id not found incase
export const getOrder = async (req: Request, res: Response) => {
  const orders = await orderService.getOrderbyID(Number(req.params.id));
  if (!orders)
    return res.status(404).json({ message: "Order cannot be found" });
  logger.warn("Order cannot be found");
  res.json(orders);
};

//Order cancellation
export const cancelOrder = async (req: Request, res: Response) => {
  await orderService.deleteOrder(Number(req.params.id));
  logger.warn("Order has been cancelled");
  res.json({ message: "Order cancelled" });
};
