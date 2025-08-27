//POSTMAN

import { Request, Response } from "express";
import { AppDataSource } from "config/.ormconfig.js";
import { User } from "models/User.js";
import bcrypt from "bcrypt";
import { generateToken } from "utils/jwt.js";

const userRepo = AppDataSource.getRepository(User);

//controller for authentication for register
export const registerUser = async (req: Request, res: Response) => {
  //get data from body bascially just requesting the body that its
  const { email, password, role } = req.body;
  try {
    const existing = await userRepo.findOneBy({ email });
    if (existing) return res.status(409).json({ message: "USer Exists" });

    //hashing using bcrypt //Try argon2 later utsav
    const hashed = await bcrypt.hash(password, 10);
    const user = userRepo.create({ email, password: hashed, role });
    await userRepo.save(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

//controller for authentication for login //similar to registration but no role input
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await userRepo.findOneBy({ email });
    if (!user) return res.status(400).json({ message: "Invalid Credientials" });
    //validation if they exist
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid Credentials" });

    const token = generateToken({ id: user.id, role: user.role });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};
