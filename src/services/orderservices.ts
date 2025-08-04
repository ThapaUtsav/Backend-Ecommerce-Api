// services/orderService.ts
import { AppDataSource } from "../config/.ormconfig.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { OrderItem } from "models/Orderitem.js";
import { User } from "../models/User.js";
import { Repository } from "typeorm";

// Repositories
const orderRepo = AppDataSource.getRepository(Order);
const userRepo = AppDataSource.getRepository(User);
const productRepo = AppDataSource.getRepository(Product);

//separated the oredre item logic for calculation
const buildOrderItems = async (
  items: { productId: number; quantity: number }[],
  productRepo: Repository<Product>
): Promise<{ orderItems: OrderItem[]; total: number }> => {
  let total = 0;
  const orderItems: OrderItem[] = [];

  //for every item added multiplication logic through product id
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

//Creation of order
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

//History of user
export const getOrdersByUser = async (userId: number) => {
  return await orderRepo.find({
    where: { user: { id: userId } },
    relations: ["items", "items.product"],
    order: { created_at: "DESC" },
  });
};

//update link to status change needed

export const updateOrderService = async (
  userId: number,
  orderId: number,
  orderData: Partial<Order>
) => {
  const order = await orderRepo.findOne({
    where: {
      id: orderId,
      user: { id: userId },
    },
    relations: ["user"],
  });

  if (!order) {
    return null;
  }

  // Prevent updating forbidden fields
  if ("user" in orderData || "items" in orderData) {
    throw new Error("Cannot update user or items directly.");
  }
  const { total } = orderData;
  if (total !== undefined) order.total = total;

  return await orderRepo.save(order);
};
