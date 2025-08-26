var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, } from "typeorm";
import { Order } from "./Order.js";
let User = class User {
    constructor() {
        this.orders = null;
    }
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    Column({ unique: true, type: "varchar" }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    Column({ type: "varchar" }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    Column({ default: "customer", type: "varchar" }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    CreateDateColumn({ name: "created_at" }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ name: "updated_at" }),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    OneToMany(() => Order, (order) => order.user),
    __metadata("design:type", Object)
], User.prototype, "orders", void 0);
User = __decorate([
    Entity({ name: "users" })
], User);
export { User };
