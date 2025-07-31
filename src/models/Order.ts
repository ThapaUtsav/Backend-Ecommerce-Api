// models/Order.ts
import { User } from "./User.js";
import { OrderItem } from "./Orderitem.js";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from "typeorm";
@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.orders)
  user!: User;
  @OneToMany(() => OrderItem, (item) => item.order)
  items!: OrderItem[];

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  total!: number;
}
