//should be server (confused) but this regarded as a server configuration where as if u go to server.ts
import "reflect-metadata";
import { AppDataSource } from "./config/.ormconfig.js";
import express from "express";
import dotenv from "dotenv";
import router from "./routes/auth.routes.js";
dotenv.config();

const app = express();
app.use(express.json());
app.use("/api", router);

// routes to be changed into routes folder
AppDataSource.initialize()
  .then(() => console.log("DB connected"))
  .catch((err) => console.error("DB connection error:", err));

export default app;
