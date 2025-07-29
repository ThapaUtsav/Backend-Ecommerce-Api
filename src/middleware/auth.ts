import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "a";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token Missing" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    //Narrowing to JWTpayload
    if (typeof decoded === "object" && "id" in decoded && "role" in decoded) {
      req.user = decoded as JwtPayload & {
        id: number;
        role: "admin" | "customer";
      };
      next();
    } else {
      return res.status(403).json({ message: "Invalid token structure" });
    }
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token", err });
  }
};
