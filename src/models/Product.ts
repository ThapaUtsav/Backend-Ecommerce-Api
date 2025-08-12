//OI HALNA NA BIRSI order items if not in db
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  name!: string;

  @Column("text")
  description!: string;

  @Column("decimal")
  price!: number;

  @Column({ type: "varchar", nullable: true })
  category?: string;

  @Column("int")
  inventory!: number;

  @Column("text", { array: true })
  images!: string[];

  @Column({ nullable: true, type: "varchar" })
  color?: string;

  @Column({ nullable: true, type: "varchar" })
  size?: string;

  @Column({ nullable: true, type: "varchar" })
  brand?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
