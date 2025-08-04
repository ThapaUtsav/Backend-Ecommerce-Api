// routes/orderRoutes.ts
import {
  createOrder,
  deleteOrderItem,
  getMyOrders,
  updateOrderItems,
} from "../controllers/order.controller.js";
import { Router } from "express";
import { authenticateToken } from "middleware/auth.js";

const router = Router();
//creation
router.post("/", authenticateToken, createOrder);
//history of order
router.get("/", authenticateToken, getMyOrders);
//orderupdate
router.put("/:order_id/items", authenticateToken, updateOrderItems);
//deleteupdate
// router.delete("/:order_id/items", authenticateToken, deleteOrderItem);
export default router;
