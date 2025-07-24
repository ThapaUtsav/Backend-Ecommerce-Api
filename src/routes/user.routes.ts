import { Router } from "express";
import { authenticateToken } from "middleware/auth.js";
import logger from "utils/logger.js";
const router = Router();

router.get("/profile", authenticateToken, (req, res) => {
  logger.info(`${JSON.stringify(req.user)}:Checked the profile`);
  res.json({
    message: "Welcome TO your Profile",
    user: req.user,
  });
});
export default router;
