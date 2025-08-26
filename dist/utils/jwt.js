import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_secret || "a";
export const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });
};
// Verify
export const verifyToken = (token) => {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === "object" && "id" in decoded && "role" in decoded) {
        return decoded;
    }
    throw new Error("Invalid token payload structure");
};
