//middleware
import "reflect-metadata";
import express from "express";
import dotenv from "dotenv";
import { DataSource } from "typeorm";
import { User } from "./models/User.js";
import { Product } from "./models/Product.js";
import { Order } from "./models/Order.js";

dotenv.config();

const app = express();
app.use(express.json());

// TODO: add your routes here

console.log("env files are", process.env.DB_NAME, process.env.DB_PASSWORD);

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: true,
  entities: [User, Product, Order],
})
  .initialize()
  .then(() => console.log("DB connected"))
  .catch((err) => console.error("DB connection error:", err));

export default app;
