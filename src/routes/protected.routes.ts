//not entirely needed

import { Router } from "express";
import { authenticateToken } from "middleware/auth.js";
import logger from "utils/logger.js";
const router = Router();

router.get("/dashboard", authenticateToken, (req, res) => {
  logger.info(`${JSON.stringify(req.body)}:Used Dashboard`);
  res.json({ message: "Welcome to your Dashboard!", user: req.user });
});
export default router;
