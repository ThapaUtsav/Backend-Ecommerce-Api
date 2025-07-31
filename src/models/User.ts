import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Order } from "./Order.js";
import { nullable } from "zod";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, type: "varchar" })
  email!: string;

  @Column({ type: "varchar" })
  password!: string;

  @Column({ default: "customer", type: "varchar" })
  role!: "admin" | "customer";

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[] | null = null;
}
