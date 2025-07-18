//OI HALNA NA BIRSI order items if not in db
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  name!: string;

  @Column("text")
  description!: string;

  @Column("decimal")
  price!: number;

  @Column({ type: "varchar" })
  category!: string;

  @Column("int")
  stock!: number;

  @Column("simple-array") //for images
  images!: string[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
