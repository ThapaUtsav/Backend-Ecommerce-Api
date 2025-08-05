// models/OrderItem.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Order } from "./Order.js";
import { Product } from "./Product.js";
export enum OrderStatus {
  PENDING = "pending",
  CANCELLED = "cancelled",
  DONE = "done",
}
@Entity("order_items")
export class OrderItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: "order_id" })
  order!: Order;

  @ManyToOne(() => Product)
  @JoinColumn({ name: "product_id" })
  product!: Product;

  @Column("int")
  quantity!: number;

  @Column("decimal", { precision: 10, scale: 2 })
  price!: number;

  @Column({ type: "varchar", default: OrderStatus.PENDING })
  status!: OrderStatus;
}
