import jwt from "jsonwebtoken";
const JWT_secret = process.env.JWT_secret || "a";

export const generateToken = (payload: object) => {
  // return jwt.sign(payload, JWT_secret, { expiresIn });
  return jwt.sign(payload, JWT_secret, { expiresIn: "1h" });
};
export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_secret);
};
