var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
// models/OrderItem.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, } from "typeorm";
import { Order } from "./Order.js";
import { Product } from "./Product.js";
export var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["CANCELLED"] = "CANCELLED";
    OrderStatus["DONE"] = "DONE";
})(OrderStatus || (OrderStatus = {}));
let OrderItem = class OrderItem {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], OrderItem.prototype, "id", void 0);
__decorate([
    ManyToOne(() => Order, (order) => order.items),
    JoinColumn({ name: "order_id" }),
    __metadata("design:type", Order)
], OrderItem.prototype, "order", void 0);
__decorate([
    ManyToOne(() => Product),
    JoinColumn({ name: "product_id" }),
    __metadata("design:type", Product)
], OrderItem.prototype, "product", void 0);
__decorate([
    Column("int"),
    __metadata("design:type", Number)
], OrderItem.prototype, "quantity", void 0);
__decorate([
    Column("decimal", { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], OrderItem.prototype, "price", void 0);
__decorate([
    Column({ type: "varchar", default: OrderStatus.PENDING }),
    __metadata("design:type", String)
], OrderItem.prototype, "status", void 0);
OrderItem = __decorate([
    Entity("order_items")
], OrderItem);
export { OrderItem };
