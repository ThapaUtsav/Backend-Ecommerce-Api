import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { User } from "./User.js";

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { nullable: false })
  user!: User;

  @Column("jsonb") //product list
  items!: {
    productId: number;
    quantity: number;
  }[];

  @Column("decimal")
  total!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
