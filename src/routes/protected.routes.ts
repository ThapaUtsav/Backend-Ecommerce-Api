import { Router } from "express";
import { authenticateToken } from "middleware/auth.js";

const router = Router();

router.get("/dashboard", authenticateToken, (req, res) => {
  res.json({ message: "Welcome to your Dashboard!", user: req.user });
});
export default router;
