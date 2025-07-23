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
import logger from "utils/logger.js";

// routes to be changed into routes folder
// AppDataSource.initialize()
//   .then(() => console.log("DB connected"))
//   .catch((err) => console.error("DB connection error:", err));

//make asynchronous only after DB connction will it work
const connectdb = async () => {
  try {
    await AppDataSource.initialize();
    logger.info("DB connected");
  } catch (err) {
    logger.info("Db connection error:", err);
    process.exit(1);
  }
};

connectdb();
export default app;
