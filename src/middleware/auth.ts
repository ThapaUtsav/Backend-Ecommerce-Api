//middle ware for authentication
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "a";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  //extraction of token bearer
  const token = authHeader?.split(" ")[1];
  //token based checks
  //token changes through postman
  if (!token) {
    return res.status(401).json({ message: "Token Missing" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token", err });
  }
};
