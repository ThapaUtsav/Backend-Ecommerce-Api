import { z } from "zod";

export const userRegistrationSchema = z.object({
  email: z.email().nonempty("Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z.enum(["customer", "admin"]).optional().default("customer"),
});

export const userLoginSchema = z.object({
  email: z.email().nonempty("Email is required"),
  password: z.string().nonempty("Password is required"),
});
