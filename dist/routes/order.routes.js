// routes/orderRoutes.ts
import { deleteProduct } from "controllers/product.controller.js";
import { createOrder, getMyOrders, updateOrderItemStatusController, updateOrderStatusController, } from "../controllers/order.controller.js";
import { Router } from "express";
import { authenticateToken } from "middleware/auth.js";
const router = Router();
//creation{POST}
router.post("/", authenticateToken, createOrder);
//history of order {GET}
router.get("/", authenticateToken, getMyOrders);
//update admin change on pending to be done or cancel the update
router.put("/:orderId/status", authenticateToken, updateOrderStatusController);
//single order status order
router.put("/items/:itemId/status", authenticateToken, updateOrderItemStatusController);
//order deletion
router.delete("/:id", authenticateToken, deleteProduct);
export default router;
