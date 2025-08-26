var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// services/orderService.ts
import { AppDataSource } from "../config/.ormconfig.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { OrderItem, OrderStatus } from "../models/Orderitem.js";
import { User } from "../models/User.js";
import { authorizeAdmin } from "middleware/authadmin.js";
// Repositories
const orderRepo = AppDataSource.getRepository(Order);
const userRepo = AppDataSource.getRepository(User);
const productRepo = AppDataSource.getRepository(Product);
const orderItemRepo = AppDataSource.getRepository(OrderItem);
// Create Order
export const createOrderService = (userId, items) => __awaiter(void 0, void 0, void 0, function* () {
    // Find user normally
    const user = yield userRepo.findOneByOrFail({ id: userId });
    // Validate and process order items with quantity check
    const processedOrderItems = [];
    let total = 0;
    for (const item of items) {
        const product = yield productRepo.findOneByOrFail({ id: item.productId });
        if (product.inventory < item.quantity) {
            throw new Error(`Insufficient quantity for product ${product.name}`);
        }
        // Reduce product quantity and save immediately
        product.inventory -= item.quantity;
        yield productRepo.save(product);
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
    const savedOrder = yield orderRepo.save(order);
    return savedOrder;
});
// Get Orders by User with pagination for admin
export const getOrdersByUser = (userId, limit, offset) => __awaiter(void 0, void 0, void 0, function* () {
    const qb = orderRepo.createQueryBuilder("order");
    const total = yield qb.getCount();
    if (limit !== undefined)
        qb.take(limit);
    if (offset !== undefined)
        qb.skip(offset);
    qb.leftJoinAndSelect("order.items", "items");
    qb.leftJoinAndSelect("items.product", "product");
    const data = yield qb.getMany();
    return { data, total, qb };
});
//this is for users private order to see their private orders
export const getOrdersByUsers = (userId, limit, offset) => __awaiter(void 0, void 0, void 0, function* () {
    const orderRepo = AppDataSource.getRepository(Order);
    // Count total orders for the user
    const total = yield orderRepo.count({ where: { user_id: userId } });
    // Fetch orders with items and products for the user
    const qb = orderRepo
        .createQueryBuilder("order")
        .where("order.user_id = :user_id", { user_id: userId })
        .leftJoinAndSelect("order.items", "items")
        .leftJoinAndSelect("items.product", "product");
    if (limit !== undefined)
        qb.take(limit);
    if (offset !== undefined)
        qb.skip(offset);
    const data = yield qb.getMany();
    return { data, total };
});
// Update Single Order for user
export const updateOrderItemStatus = (userId, orderItemId, newStatus) => __awaiter(void 0, void 0, void 0, function* () {
    const orderItem = yield orderItemRepo.findOne({
        where: { id: orderItemId },
        relations: ["order", "order.user", "product"],
    });
    if (!orderItem)
        throw new Error("Order item not found");
    if (newStatus === OrderStatus.DONE && !authorizeAdmin) {
        throw new Error("Unauthorized: Only admin can mark DONE");
    }
    if (!authorizeAdmin && orderItem.order.user.id !== userId) {
        throw new Error("Unauthorized: Not your order item");
    }
    const revertedItemsUser = [];
    if (newStatus === OrderStatus.CANCELLED &&
        orderItem.status !== OrderStatus.CANCELLED) {
        const product = orderItem.product;
        product.inventory += orderItem.quantity;
        yield productRepo.save(product);
        revertedItemsUser.push({ product, quantity: orderItem.quantity });
    }
    orderItem.status = newStatus;
    return {
        message: `Order item ${orderItemId} updated to ${newStatus}`,
        revertedItemsUser: revertedItemsUser.length,
    };
});
// Admin Status change on DONE OR CANCEL
export const updateAllOrderItemsStatus = (userId, orderId, newStatus) => __awaiter(void 0, void 0, void 0, function* () {
    const order = yield orderRepo.findOne({
        where: { id: orderId },
        relations: ["user", "items", "items.product"],
    });
    if (!order)
        throw new Error("Order not found");
    if (newStatus === OrderStatus.DONE && !authorizeAdmin) {
        throw new Error("Unauthorized:  Only admin can mark DONE");
    }
    if (!authorizeAdmin && order.user.id !== userId) {
        throw new Error("Unauthorized: Cannot update this order");
    }
    const revertedItems = [];
    for (const item of order.items) {
        if (newStatus === OrderStatus.CANCELLED &&
            item.status !== OrderStatus.CANCELLED) {
            const product = item.product;
            product.inventory += item.quantity;
            yield productRepo.save(product);
            revertedItems.push({ product, quantity: item.quantity });
        }
        item.status = newStatus;
        yield orderItemRepo.save(item);
    }
    return {
        message: `All items in order ${orderId} updated to ${newStatus}`,
        revertedItems: revertedItems.length,
    };
});
//deletion of orders
//user side deltion will stay a audit of the product
//admin side will comepletely delete it
export const deleteOrderService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const order = yield orderRepo.findOne({ where: { id } });
    if (!order)
        return null;
    order.deletion_status = true;
    yield orderRepo.save(order);
    return order;
});
