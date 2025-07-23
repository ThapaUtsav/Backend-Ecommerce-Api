import { Router } from "express";
import { registerUser, loginUser } from "../controllers/auth.controller.js";
import { validateBody } from "../middleware/validate.js";
import {
  userRegistrationSchema,
  userLoginSchema,
} from "../validators/user.validation.js";

const router = Router();

router.post("/register", validateBody(userRegistrationSchema), registerUser);
router.post("/login", validateBody(userLoginSchema), loginUser);

export default router;
