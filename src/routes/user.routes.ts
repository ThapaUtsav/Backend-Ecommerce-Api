import { Router } from "express";
import { authenticateToken } from "middleware/auth.js";

const router = Router();

router.get("/profile", authenticateToken, (req, res) => {
  res.json({
    message: "Welcome TO your Profile",
    user: req.user,
  });
});
export default router;
