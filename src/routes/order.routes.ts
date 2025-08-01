// routes/orderRoutes.ts
import { createOrder, getMyOrders } from "../controllers/order.controller.js";
import { Router } from "express";
import { authenticateToken } from "middleware/auth.js";

const router = Router();
//creation
router.post("/", authenticateToken, createOrder);
//history of order
router.get("/", authenticateToken, getMyOrders);

export default router;
