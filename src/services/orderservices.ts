import { AppDataSource } from "config/.ormconfig.js";
import { Order } from "models/Order.js";

export const createOrder = async (
  userId: number,
  productId: number,
  quantity: number
) => {
  const orderRepo = AppDataSource.getRepository(Order);
  const newOrder = orderRepo.create({
    user: { id: userId },
    product: { id: productId },
    quantity,
  });
  return await orderRepo.save(newOrder);
};
export const getAllOrders = async () => {
  const orderRepo = AppDataSource.getRepository(Order);
  return await orderRepo.find({ relations: ["user", "product"] });
};
export const getOrderbyID = async (id: number) => {
  const orderRepo = AppDataSource.getRepository(Order);
  return await orderRepo.find({
    where: { id },
    relations: ["user", "product"],
  });
};
export const deleteOrder = async (id: number) => {
  const orderRepo = AppDataSource.getRepository(Order);
  return await orderRepo.delete(id);
};
