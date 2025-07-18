import { Router } from "express";
import { registerUser, loginUser } from "../controllers/auth.controller.js";
const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
//SENDING ROUTER DATA tei routing basically (res,req,next)=>{next()} sending to index?
export default router;
