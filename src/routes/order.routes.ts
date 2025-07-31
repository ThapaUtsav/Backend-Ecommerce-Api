// src/routes/order.routes.ts
import { Router } from "express";
import * as orderController from "../controllers/order.controller.js";
import { authenticateToken } from "../middleware/auth.js"; // adjust as needed

const router = Router();

router.post("/", authenticateToken, orderController.createOrder);
router.get("/", orderController.getOrders);
router.get("/:id", orderController.getOrder);
router.delete("/:id", authenticateToken, orderController.cancelOrder);

export default router;
