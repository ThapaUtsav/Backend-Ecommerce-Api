// routes/order.routes.ts
import { Router } from "express";
import { createOrderHandler } from "controllers/order.controller.js";
const router = Router();

router.post("/orders", createOrderHandler);

export default router;
