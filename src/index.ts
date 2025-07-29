import "reflect-metadata";
import { AppDataSource } from "./config/.ormconfig.js";
import express from "express";
import dotenv from "dotenv";
import router from "./routes/auth.routes.js";
import dashRoutes from "./routes/protected.routes.js";
import userRoutes from "./routes/user.routes.js";
import prodRoutes from "./routes/product.routes.js";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();
app.use(express.json());
app.use("/api", router);
app.use("/api", userRoutes);
app.use("/api", dashRoutes);
app.use("/api/products", prodRoutes);

// Load OpenAPI spec
const openApiSpec = JSON.parse(
  fs.readFileSync(path.resolve("openapi.json"), "utf-8")
);

// Serve Swagger UI at /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

const connectdb = async () => {
  try {
    await AppDataSource.initialize();
    console.log("DB connected");
  } catch (err) {
    console.log("Db connection error:", err);
    process.exit(1);
  }
};

connectdb();

export default app;
