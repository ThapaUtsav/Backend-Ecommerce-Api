// services/orderService.ts
import { AppDataSource } from "config/.ormconfig.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { OrderItem } from "models/Orderitem.js";
import { User } from "../models/User.js";

export const createOrder = async (
  userId: number,
  items: { productId: number; quantity: number }[]
) => {
  const userRepo = AppDataSource.getRepository(User);
  const productRepo = AppDataSource.getRepository(Product);
  const orderRepo = AppDataSource.getRepository(Order);

  const user = await userRepo.findOneByOrFail({ id: userId });

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

  const order = new Order();
  order.user = user;
  order.user_id = user.id;
  order.items = orderItems;
  order.total = total;

  return await orderRepo.save(order);
};

export const getOrdersByUser = async (userId: number) => {
  const orderRepo = AppDataSource.getRepository(Order);
  return await orderRepo.find({
    where: { user: { id: userId } },
    relations: ["items", "items.product"],
    order: { created_at: "DESC" },
  });
};
