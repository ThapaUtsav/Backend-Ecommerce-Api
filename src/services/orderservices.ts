// services/orderService.ts
import { AppDataSource } from "../config/.ormconfig.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { OrderItem, OrderStatus } from "../models/Orderitem.js";
import { User } from "../models/User.js";

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
  // Find user normally
  const user = await userRepo.findOneByOrFail({ id: userId });

  // Validate and process order items with quantity check
  const processedOrderItems: OrderItem[] = [];
  let total = 0;

  for (const item of items) {
    const product = await productRepo.findOneByOrFail({ id: item.productId });
    if (product.inventory < item.quantity) {
      throw new Error(`Insufficient quantity for product ${product.name}`);
    }

    // Reduce product quantity and save immediately
    product.inventory -= item.quantity;
    await productRepo.save(product);

    const orderItem = new OrderItem();
    orderItem.product = product;
    orderItem.quantity = item.quantity;
    orderItem.price = Number(product.price);

    total += orderItem.price * item.quantity;
    processedOrderItems.push(orderItem);
  }

  // Create and save order (orderItems will be saved via cascade if set up)
  const order = new Order();
  order.user = user;
  order.items = processedOrderItems;
  order.total = total;

  const savedOrder = await orderRepo.save(order);
  return savedOrder;
};

// Get Orders by User with pagination
export const getOrdersByUser = async (
  userId: string,
  limit?: number,
  offset?: number
) => {
  const qb = orderRepo
    .createQueryBuilder("o")
    .leftJoinAndSelect("o.items", "items")
    .leftJoinAndSelect("items.product", "product")
    .where("o.user_id = :userId", { userId })
    .orderBy("o.created_at", "DESC");

  const total = await qb.getCount();

  if (limit !== undefined) qb.take(limit);
  if (offset !== undefined) qb.skip(offset);

  const data = await qb.getMany();

  return { data, total, qb };
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
    relations: ["user", "items", "items.product"],
  });

  if (!order) throw new Error("Order not found");

  if (newStatus === OrderStatus.DONE && !isAdmin) {
    throw new Error("Unauthorized:  Only admin can mark DONE");
  }

  if (!isAdmin && order.user.id !== userId) {
    throw new Error("Unauthorized: Cannot update this order");
  }

  const revertedItems: { product: Product; quantity: number }[] = [];

  for (const item of order.items) {
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
  }

  return {
    message: `All items in order ${orderId} updated to ${newStatus}`,
    revertedItems: revertedItems.length,
  };
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
    relations: ["order", "order.user", "product"],
  });

  if (!orderItem) throw new Error("Order item not found");

  if (newStatus === OrderStatus.DONE && !isAdmin) {
    throw new Error("Unauthorized: Only admin can mark DONE");
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
    message: `Order item ${orderItemId} updated to ${newStatus}`,
    revertedItemsUser: revertedItemsUser.length,
  };
};
