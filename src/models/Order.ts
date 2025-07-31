// src/models/Order.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { User } from "./User.js";
import { Product } from "./Product.js";
@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.orders)
  user!: User;

  @ManyToOne(() => Product)
  product!: Product;

  @Column()
  quantity!: number;

  @Column({ default: "pending" })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
