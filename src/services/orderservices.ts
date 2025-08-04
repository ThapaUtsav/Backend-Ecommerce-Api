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
const orderItemRepo = AppDataSource.getRepository(OrderItem);

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

//update
export const updateOrderService = async (
  userId: number,
  orderId: number,
  updates: { productId: number; quantity: number }[]
) => {
  const order = await orderRepo.findOne({
    where: { id: orderId, user: { id: userId } },
    relations: ["items", "items.product"],
  });
  if (!order) throw new Error("ORder not Found");
  for (const update of updates) {
    const exisitingItem = order.items.find(
      (item) => item.product.id === update.productId
    );
    if (exisitingItem) {
      exisitingItem.quantity += update.quantity;

      //remove item if quantity is 0
      if (exisitingItem.quantity <= 0) {
        await orderItemRepo.remove(exisitingItem);
        order.items = order.items.filter((i) => i.id !== exisitingItem.id);
      }
    } else {
      //New produts to fetch and add
      const product = await productRepo.findOneByOrFail({
        id: update.productId,
      });
      const newItem = new OrderItem();
      newItem.product = product;
      newItem.quantity = update.quantity;
      newItem.price = Number(product.price);
      newItem.order = order;

      await orderItemRepo.save(newItem);
      order.items.push(newItem);
    }
  }

  //updates causes recalculation
  order.total = order.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );
  return await orderRepo.save(order);
};

//delete service logic
export const deleteOrderItemService = async (
  userId: number,
  orderId: number,
  itemId: number
): Promise<boolean> => {
  // Verify order belongs to user
  const order = await orderRepo.findOne({
    where: { id: orderId, user: { id: userId } },
    relations: ["items"],
  });

  if (!order) return false;

  // Find the item to delete
  const item = order.items.find((i) => i.id === itemId);
  if (!item) return false;

  // Delete the item
  await orderItemRepo.remove(item);

  // Recalculate order total
  const updatedItems = order.items.filter((i) => i.id !== itemId);
  order.total = updatedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  await orderRepo.save(order);

  return true;
};
