// services/orderservices.ts
import { AppDataSource } from "config/.ormconfig.js";
import { Order } from "models/Order.js";
import { OrderItem } from "models/Orderitem.js";
import { Product } from "models/Product.js";
import { User } from "models/User.js";
export const createOrder = async (
  userId: number,
  items: { productId: number; quantity: number }[]
) => {
  const orderRepo = AppDataSource.getRepository(Order);
  const orderItemRepo = AppDataSource.getRepository(OrderItem);
  const productRepo = AppDataSource.getRepository(Product);
  const userRepo = AppDataSource.getRepository(User);

  const user = await userRepo.findOneByOrFail({ id: userId });

  let total = 0;
  const orderItems: OrderItem[] = [];

  for (const item of items) {
    const product = await productRepo.findOneByOrFail({ id: item.productId });

    const itemTotal = Number(product.price) * item.quantity;
    total += itemTotal;

    const orderItem = orderItemRepo.create({
      product,
      quantity: item.quantity,
      price: product.price,
    });

    orderItems.push(orderItem);
  }

  const order = orderRepo.create({
    user,
    total,
    items: orderItems,
  });

  await orderRepo.save(order);

  return order;
};
