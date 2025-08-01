import "reflect-metadata";
import { AppDataSource } from "./config/.ormconfig.js";
import express from "express";
import dotenv from "dotenv";
import router from "./routes/auth.routes.js";
import dashRoutes from "./routes/protected.routes.js";
import userRoutes from "./routes/user.routes.js";
import prodRoutes from "./routes/product.routes.js";
import swaggerUi from "swagger-ui-express";
import orderRoutes from "./routes/order.routes.js";
import fs from "fs";
import path from "path";
import cors from "cors";

dotenv.config();

const app = express();

// Enable CORS **before** routes
app.use(cors());

app.use(express.json());
app.use("/api", router);
app.use("/api", userRoutes);
app.use("/api", dashRoutes);
app.use("/api/products", prodRoutes);
app.use("/api/orders", orderRoutes);

// Load OpenAPI spec from file once
const openApiSpec = JSON.parse(
  fs.readFileSync(path.resolve("openapi.json"), "utf-8")
);
app.get("/swagger.json", cors(), (req, res) => {
  res.json(openApiSpec);
});

// Serve Swagger UI and configure it to fetch swagger.json from /swagger.json
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: "http://localhost:3000/swagger.json", // Use full URL with protocol
    },
  })
);

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
