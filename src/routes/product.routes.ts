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
// import { productCreationSchema } from "../validators/product.validation.js";
import { authenticateToken } from "../middleware/auth.js"; //token for user
import { authorizeAdmin } from "../middleware/authadmin.js";
import { upload } from "middleware/multerconfig.js";
const router = Router();

router.get(
  "/",
  authenticateToken,
  // isAdminMiddleware,
  // validateBody,
  getAllProducts
);
router.get("/:id", authenticateToken, validateBody, getProductById);

// PRoduct creation
router.post(
  "/",
  authenticateToken,
  authorizeAdmin,
  upload.array("images", 5),
  // validateBody(productCreationSchema), //validation  already done in controller
  createProduct
);
router.put(
  "/:id",
  authenticateToken,
  authorizeAdmin,
  // validateBody(productCreationSchema), //valdiation arleady done in controller
  updateProduct
);
router.delete("/:id", authenticateToken, authorizeAdmin, deleteProduct);
export default router;
