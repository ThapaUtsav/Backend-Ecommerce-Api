// models/OrderItem.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Order } from "./Order.js";
import { Product } from "./Product.js";
@Entity("order_items")
export class OrderItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Order, (order) => order.items)
  order!: Order;

  @ManyToOne(() => Product)
  product!: Product;

  @Column("int") // explicitly define type
  quantity!: number;

  @Column("decimal", { precision: 10, scale: 2 }) // define type for price
  price!: number;
}
