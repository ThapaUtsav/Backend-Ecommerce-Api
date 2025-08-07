// services/orderService.ts
import { AppDataSource } from "../config/.ormconfig.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { OrderItem, OrderStatus } from "../models/Orderitem.js";
import { User } from "../models/User.js";
import logger from "utils/logger.js";

// Repositories
const orderRepo = AppDataSource.getRepository(Order);
const userRepo = AppDataSource.getRepository(User);
const productRepo = AppDataSource.getRepository(Product);
const orderItemRepo = AppDataSource.getRepository(OrderItem);

// Create Order
export const createOrderService = async (
  userId: number,
  items: { productId: number; quantity: number }[]
) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const user = await userRepo.findOneByOrFail({ id: userId });

    // Validate and process order items with quantity check
    const processedOrderItems: OrderItem[] = [];
    let total = 0;

    for (const item of items) {
      const product = await productRepo.findOneByOrFail({ id: item.productId });
      //MORE than asked
      if (product.inventory < item.quantity) {
        throw new Error(`Insufficient quantity for product ${product.name}`);
      }

      // Reduce product quantity
      product.inventory -= item.quantity;
      await productRepo.save(product);
      const orderItem = new OrderItem();
      orderItem.product = product;
      orderItem.quantity = item.quantity;

      // Calculate price
      const price = Number(product.price);
      orderItem.price = price;
      total += price * item.quantity;

      processedOrderItems.push(orderItem);
    }
    // Create order
    const order = new Order();
    order.user = user;
    order.items = processedOrderItems;
    order.total = total;
    const savedOrder = await orderRepo.save(order);
    await queryRunner.commitTransaction();

    return savedOrder;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw new Error("Failed to create order: " + (error as Error).message);
  } finally {
    await queryRunner.release();
  }
};

// Get Orders by User
export const getOrdersByUser = async (userId: number) => {
  return await orderRepo.find({
    where: { user: { id: userId } },
    relations: ["items", "items.product"],
    order: { created_at: "DESC" },
  });
};

// Admin Status change on DONE OR CANCEL
export const updateAllOrderItemsStatus = async (
  userId: number,
  orderId: number,
  newStatus: OrderStatus,
  isAdmin: boolean
) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    const order = await orderRepo.findOne({
      where: { id: orderId },
      relations: ["user", "items", "items.product"],
    });

    if (!order) throw new Error("Order not found");

    if (newStatus === OrderStatus.DONE && !isAdmin) {
      throw new Error("Unauthorized: Only admin can mark DONE");
    }

    if (!isAdmin && order.user.id !== userId) {
      throw new Error("Unauthorized: Cannot update this order");
    }
    //main revert items to product inventroy
    const revertedItems: { product: Product; quantity: number }[] = [];

    await Promise.all(
      order.items.map(async (item) => {
        if (
          newStatus === OrderStatus.CANCELLED &&
          item.status !== OrderStatus.CANCELLED
        ) {
          const product = item.product;
          product.inventory += item.quantity;
          await productRepo.save(product);
          revertedItems.push({ product, quantity: item.quantity });
        }
        item.status = newStatus;
        await orderItemRepo.save(item);
      })
    );
    return {
      message: `All items in order ${orderId} updated to ${newStatus}`,
      revertedItems: revertedItems.length,
    };
  } catch (error) {
    logger.error("Error foudn", error);
    throw error;
  } finally {
    await queryRunner.release();
  }
};

// Update Single Order for user
export const updateOrderItemStatus = async (
  userId: number,
  orderItemId: number,
  newStatus: OrderStatus,
  isAdmin: boolean
) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  try {
    const orderItem = await orderItemRepo.findOne({
      where: { id: orderItemId },
      relations: ["order", "order.user", "product"],
    });

    if (!orderItem) throw new Error("Order item not found");

    if (newStatus === OrderStatus.DONE && !isAdmin) {
      throw new Error("Unauthorized: Only admin can mark  DONE");
    }

    if (!isAdmin && orderItem.order.user.id !== userId) {
      throw new Error("Unauthorized: Not your order item");
    }
    const revertedItemsUser: { product: Product; quantity: number }[] = [];
    if (
      newStatus === OrderStatus.CANCELLED &&
      orderItem.status !== OrderStatus.CANCELLED
    ) {
      const product = orderItem.product;
      product.inventory += orderItem.quantity;
      await productRepo.save(product);
      revertedItemsUser.push({ product, quantity: orderItem.quantity });
    }
    orderItem.status = newStatus;
    const updatedItem = await orderItemRepo.save(orderItem);
    return {
      message: `All items in order ${orderItemId} updated to ${newStatus}`,
      revertedItemsUser: revertedItemsUser.length,
    };
  } catch (error) {
    logger.error("Error detected on update on status", error);
    throw error;
  } finally {
    await queryRunner.release();
  }
};
