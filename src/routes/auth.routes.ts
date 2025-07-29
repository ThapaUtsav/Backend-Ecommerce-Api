import { Router } from "express";
import { registerUser, loginUser } from "../controllers/auth.controller.js";
import { validateBody } from "../middleware/validate.js";
import {
  userRegistrationSchema,
  userLoginSchema,
} from "../validators/user.validation.js";

import logger from "utils/logger.js";

const router = Router();

router.post("/register", validateBody(userRegistrationSchema), (req, res) => {
  logger.info(`User registration attempt:${JSON.stringify(req.body)}`);
  registerUser(req, res);
});
router.post("/login", validateBody(userLoginSchema), (req, res) => {
  // logger.info(`User login attempt: ${JSON.stringify(req.body)}`);
  if (req.body && req.body.role !== "customer") {
    logger.info(`Admin login attempt: ${JSON.stringify(req.body)}`);
  } else {
    logger.info(`User login attempt: ${JSON.stringify(req.body)}`);
  }
  loginUser(req, res);
});

export default router;
