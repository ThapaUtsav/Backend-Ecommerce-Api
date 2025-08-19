import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "a";
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Token Missing" });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        //Narrowing to JWTpayload
        if (typeof decoded === "object" && "id" in decoded && "role" in decoded) {
            req.user = decoded;
            next();
        }
        else {
            return res.status(403).json({ message: "Invalid token structure" });
        }
    }
    catch (err) {
        res.status(403).json({ message: "Invalid or expired token", err });
    }
};
