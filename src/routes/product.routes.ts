// src/routes/product.routes.ts
import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import { validateBody } from "../middleware/validate.js"; //validate before getting to product
import { productCreationSchema } from "../validators/product.validation.js"; //this is just product validation
import { authenticateToken } from "../middleware/auth.js"; //token for user
import { authorizeAdmin } from "../middleware/authadmin.js";

const router = Router();

router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Protected routes
router.post(
  "/",
  authenticateToken,
  authorizeAdmin,
  validateBody(productCreationSchema),
  createProduct
);
router.put(
  "/:id",
  authenticateToken,
  authorizeAdmin,
  validateBody(productCreationSchema),
  updateProduct
);
router.delete("/:id", authenticateToken, authorizeAdmin, deleteProduct);
export default router;
