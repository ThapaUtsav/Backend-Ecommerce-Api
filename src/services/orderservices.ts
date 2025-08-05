// services/orderService.ts
import { AppDataSource } from "../config/.ormconfig.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { OrderItem, OrderStatus } from "../models/Orderitem.js";
import { User } from "../models/User.js";
import { Repository } from "typeorm";

// Repositories
const orderRepo = AppDataSource.getRepository(Order);
const userRepo = AppDataSource.getRepository(User);
const productRepo = AppDataSource.getRepository(Product);
const orderItemRepo = AppDataSource.getRepository(OrderItem);

// Utility: Create order items and calculate total
const buildOrderItems = async (
  items: { productId: number; quantity: number }[],
  productRepo: Repository<Product>
): Promise<{ orderItems: OrderItem[]; total: number }> => {
  let total = 0;
  const orderItems: OrderItem[] = [];

  for (const item of items) {
    const product = await productRepo.findOneByOrFail({ id: item.productId });
    const price = Number(product.price);
    total += price * item.quantity;

    const orderItem = new OrderItem();
    orderItem.product = product;
    orderItem.quantity = item.quantity;
    orderItem.price = price;
    orderItems.push(orderItem);
  }

  return { orderItems, total };
};

// Create Order
export const createOrderService = async (
  userId: number,
  items: { productId: number; quantity: number }[]
) => {
  try {
    const user = await userRepo.findOneByOrFail({ id: userId });
    const { orderItems, total } = await buildOrderItems(items, productRepo);

    const order = new Order();
    order.user = user;
    order.items = orderItems;
    order.total = total;

    return await orderRepo.save(order);
  } catch (error) {
    throw new Error("Failed to create order: " + (error as Error).message);
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
  const order = await orderRepo.findOne({
    where: { id: orderId },
    relations: ["user"],
  });

  if (!order) throw new Error("Order not found");

  if (newStatus === OrderStatus.DONE && !isAdmin) {
    throw new Error("Unauthorized: Only admin can mark DONE");
  }

  if (!isAdmin && order.user.id !== userId) {
    throw new Error("Unauthorized: Cannot update this order");
  }

  const orderItems = await orderItemRepo.find({
    where: { order: { id: orderId } },
  });

  for (const item of orderItems) {
    item.status = newStatus;
    await orderItemRepo.save(item);
  }

  return { message: `All items in order ${orderId} updated to ${newStatus}` };
};

// Update Single Order for user
export const updateOrderItemStatus = async (
  userId: number,
  orderItemId: number,
  newStatus: OrderStatus,
  isAdmin: boolean
) => {
  const orderItem = await orderItemRepo.findOne({
    where: { id: orderItemId },
    relations: ["order", "order.user"],
  });

  if (!orderItem) throw new Error("Order item not found");

  if (newStatus === OrderStatus.DONE && !isAdmin) {
    throw new Error("Unauthorized: Only admin can mark DONE");
  }

  if (!isAdmin && orderItem.order.user.id !== userId) {
    throw new Error("Unauthorized: Not your order item");
  }

  orderItem.status = newStatus;
  return await orderItemRepo.save(orderItem);
};
