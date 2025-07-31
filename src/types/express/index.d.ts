import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?:
        | JwtPayload
        | (string & {
            id: number;
            role: "admin" | "customer";
          });
    }
  }
}
export {};
