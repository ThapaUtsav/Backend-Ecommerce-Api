var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// src/services/productService.ts
import { Product } from "../models/Product.js";
import { AppDataSource } from "../config/.ormconfig.js";
const productRepo = AppDataSource.getRepository(Product);
//creation
export const createProductService = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const newProduct = productRepo.create(data);
    return yield productRepo.save(newProduct);
});
//searching all product with filter search
export const getAllProductsService = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const qb = productRepo.createQueryBuilder("product");
    // Handle Inventory if empty
    if (query.minInventory !== undefined) {
        qb.andWhere("product.inventory > :minInventory", {
            minInventory: Number(query.minInventory),
        });
    }
    Object.entries(query).forEach(([key, value]) => {
        if (typeof value !== "string")
            return;
        const cleanValue = value.trim();
        const match = key.match(/(price|inventory)_(gt|lt)/);
        if (match) {
            const [, field, operator] = match;
            const dbOpMap = {
                gt: ">",
                lt: "<",
            };
            qb.andWhere(`product.${field} ${dbOpMap[operator]} :${key}`, {
                [key]: Number(cleanValue),
            });
        }
        if (["name", "category", "brand", "color"].includes(key)) {
            qb.andWhere(`LOWER(product.${key}) LIKE LOWER(:${key})`, {
                [key]: `%${cleanValue}%`,
            });
        }
    });
    // sorting
    if (typeof query.sort === "string") {
        const [field, dirRaw] = query.sort.split("_");
        const direction = dirRaw.toLowerCase();
        if (["price", "inventory", "size"].includes(field) &&
            ["asc", "desc"].includes(direction)) {
            qb.orderBy(`product.${field}`, direction.toUpperCase());
        }
    }
    // Get total count before pagination
    const total = yield qb.getCount();
    // Apply pagination
    if (query.limit !== undefined) {
        qb.take(Number(query.limit));
    }
    if (query.offset !== undefined) {
        qb.skip(Number(query.offset));
    }
    const data = yield qb.getMany();
    return { data, total };
});
//search by ID
export const getProductByIdService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield productRepo.findOne({ where: { id } });
});
//Updating PRoduct detail
export const updateProductService = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield productRepo.findOne({ where: { id } });
    if (!product)
        return null;
    productRepo.merge(product, data);
    return yield productRepo.save(product);
});
//Delete the product
export const deleteProductService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield productRepo.findOne({ where: { id } });
    if (!product)
        return null;
    yield productRepo.remove(product);
    return product;
});
