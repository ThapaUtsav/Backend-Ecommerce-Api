var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//OI HALNA NA BIRSI order items if not in db
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, } from "typeorm";
let Product = class Product {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Product.prototype, "id", void 0);
__decorate([
    Column({ type: "varchar" }),
    __metadata("design:type", String)
], Product.prototype, "name", void 0);
__decorate([
    Column("text"),
    __metadata("design:type", String)
], Product.prototype, "description", void 0);
__decorate([
    Column("decimal"),
    __metadata("design:type", Number)
], Product.prototype, "price", void 0);
__decorate([
    Column({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "category", void 0);
__decorate([
    Column("int"),
    __metadata("design:type", Number)
], Product.prototype, "inventory", void 0);
__decorate([
    Column("text", { array: true }),
    __metadata("design:type", Array)
], Product.prototype, "images", void 0);
__decorate([
    Column({ nullable: true, type: "varchar" }),
    __metadata("design:type", String)
], Product.prototype, "color", void 0);
__decorate([
    Column({ nullable: true, type: "varchar" }),
    __metadata("design:type", String)
], Product.prototype, "size", void 0);
__decorate([
    Column({ nullable: true, type: "varchar" }),
    __metadata("design:type", String)
], Product.prototype, "brand", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Product.prototype, "created_at", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], Product.prototype, "updated_at", void 0);
Product = __decorate([
    Entity("products")
], Product);
export { Product };
