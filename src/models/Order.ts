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
  JoinColumn,
} from "typeorm";
@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  user_id!: number;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items!: OrderItem[];

  @Column({ default: false, type: "boolean" })
  deletion_status!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  total!: number;
}
