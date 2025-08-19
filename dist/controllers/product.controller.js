var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import logger from "../utils/logger.js";
import { productCreationSchema, productSchema, } from "../validators/product.validation.js";
import { createProductService, getAllProductsService, getProductByIdService, updateProductService, deleteProductService, } from "../services/productservices.js";
// CREATE PRODUCT
export const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const imageFiles = req.files;
    //file name to imageFIlename VARTEX.png to VARTEX
    //if file.file.filedname give all the images name to image
    const imageFilenames = (imageFiles === null || imageFiles === void 0 ? void 0 : imageFiles.map((file) => file.filename)) || [];
    const bodyWithImages = Object.assign(Object.assign({}, req.body), { 
        // price: req.body.price,
        // inventory: req.body.inventory,
        images: imageFilenames });
    const validation = productCreationSchema.safeParse(bodyWithImages);
    if (!validation.success) {
        logger.error(`Validation failed on product creation: ${JSON.stringify(req.body)}`, validation.error);
        return res.status(400).json({
            message: "Validation error",
            errors: validation.error,
        });
    }
    try {
        const savedProduct = yield createProductService(validation.data);
        res.status(201).json(savedProduct);
    }
    catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error(`Error creating product: ${err.message}`, { error: err });
        res.status(500).json({ message: "Error creating product" });
    }
});
// GET ALL PRODUCTS
export const getAllProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 5;
        const offset = (page - 1) * limit;
        const baseQuery = Object.assign(Object.assign({}, req.query), { limit,
            offset });
        let productsWithCount;
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === "admin") {
            productsWithCount = yield getAllProductsService(baseQuery);
        }
        else {
            const queryWithInventoryFilter = Object.assign(Object.assign({}, baseQuery), { minInventory: 1 });
            productsWithCount = yield getAllProductsService(queryWithInventoryFilter);
        }
        const totalPages = Math.ceil(productsWithCount.total / limit);
        res.json({
            data: productsWithCount.data,
            pagination: {
                page,
                limit,
                total: productsWithCount.total,
                totalPages,
            },
        });
    }
    catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("Error fetching products", { error: err });
        return res.status(500).json({ message: "Error fetching products" });
    }
});
// GET PRODUCT BY ID
export const getProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    try {
        const product = yield getProductByIdService(id);
        if (!product) {
            logger.warn(`Product not found: ID ${id}`);
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(product);
    }
    catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error(`Error fetching product ID ${id}`, { error: err });
        res.status(500).json({ message: "Error fetching product" });
    }
});
// UPDATE PRODUCT
export const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    const validation = productSchema.safeParse(req.body);
    if (!validation.success) {
        logger.error(`Validation failed on product update (ID: ${id}): ${JSON.stringify(req.body)}`, validation.error);
        return res.status(400).json({
            message: "Validation error",
            errors: validation.error,
        });
    }
    try {
        const updatedProduct = yield updateProductService(id, validation.data);
        if (!updatedProduct) {
            logger.warn(`Product not found for update: ID ${id}`);
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(updatedProduct);
    }
    catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error(`Error updating product ID ${id}: ${err.message}`, {
            error: err,
        });
        res.status(500).json({ message: "Error updating product" });
    }
});
// DELETE PRODUCT
export const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    try {
        const deletedProduct = yield deleteProductService(id);
        if (!deletedProduct) {
            logger.warn(`Product not found for deletion: ID ${id}`);
            return res.status(404).json({ message: "Product not found" });
        }
        res
            .status(200)
            .json({ message: "Product deleted", product: deletedProduct });
    }
    catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error(`Error deleting product ID ${id}: ${err.message}`, {
            error: err,
        });
        res.status(500).json({ message: "Error deleting product" });
    }
});
