import cron from "node-cron";
import { AppDataSource } from "../config/.ormconfig.js";
import { OrderItem, OrderStatus } from "../models/Orderitem.js";
import { Product } from "../models/Product.js";
import logger from "utils/logger.js";

const orderItemRepo = AppDataSource.getRepository(OrderItem);
const productRepo = AppDataSource.getRepository(Product);

// Cron job: runs every 10 seconds for demo purposes (adjust as needed)
cron.schedule("*/10 * * * * *", async () => {
  logger.info("Running cron job to check pending orders...");

  try {
    const now = new Date();

    // Find PENDING order items older than 30 seconds
    const pendingItems = await orderItemRepo.find({
      where: { status: OrderStatus.PENDING },
      relations: ["product", "order"],
    });

    for (const item of pendingItems) {
      const createdAt = new Date(item.order.created_at);
      const diff = (now.getTime() - createdAt.getTime()) / 1000; // seconds

      if (diff > 30) {
        // Cancel it and revert inventory
        item.status = OrderStatus.CANCELLED;
        item.product.inventory += item.quantity;

        await productRepo.save(item.product);
        await orderItemRepo.save(item);

        logger.info(
          `Order item ${item.id} cancelled due to timeout (${Math.round(
            diff
          )}s)`
        );
      }
    }
  } catch (error) {
    logger.error("Cron job error:", error);
  }
});
