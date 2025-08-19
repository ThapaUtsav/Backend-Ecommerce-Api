//POSTMAN
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { AppDataSource } from "config/.ormconfig.js";
import { User } from "models/User.js";
import bcrypt from "bcrypt";
import { generateToken } from "utils/jwt.js";
const userRepo = AppDataSource.getRepository(User);
//controller for authentication for register
export const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //get data from body bascially just requesting the body that its
    const { email, password, role } = req.body;
    try {
        const existing = yield userRepo.findOneBy({ email });
        //409 for  conflict error
        if (existing)
            return res.status(409).json({ message: "USer Exists" });
        //hashing using bcrypt //Try argon2 later utsav
        const hashed = yield bcrypt.hash(password, 10);
        //
        const user = userRepo.create({ email, password: hashed, role });
        yield userRepo.save(user);
    }
    catch (err) {
        res.status(500).json({ message: "Server error", error: err });
    }
});
//controller for authentication for login //similar to registration but no role input
export const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield userRepo.findOneBy({ email });
        if (!user)
            return res.status(400).json({ message: "Invalid Credientials" });
        //validation if they exist
        const valid = yield bcrypt.compare(password, user.password);
        if (!valid)
            return res.status(400).json({ message: "Invalid Credentials" });
        const token = generateToken({ id: user.id, role: user.role });
        res.json({ token });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", error: err });
    }
});
