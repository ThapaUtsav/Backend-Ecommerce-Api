import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_secret || "a";

// Adding admins
export interface AuthTokenPayload extends JwtPayload {
  id: number;
  role: "admin" | "customer";
}

export const generateToken = (payload: AuthTokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });
};

// Verify
export const verifyToken = (token: string): AuthTokenPayload => {
  const decoded = jwt.verify(token, JWT_SECRET);

  if (typeof decoded === "object" && "id" in decoded && "role" in decoded) {
    return decoded as AuthTokenPayload;
  }

  throw new Error("Invalid token payload structure");
};
