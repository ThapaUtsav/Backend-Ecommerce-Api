// src/services/productService.ts
import { Product } from "../models/Product.js";
import { AppDataSource } from "../config/.ormconfig.js";

const productRepo = AppDataSource.getRepository(Product);

//creation
export const createProductService = async (data: Partial<Product>) => {
  const newProduct = productRepo.create(data);
  return await productRepo.save(newProduct);
};

//searching all product with filter search
export const getAllProductsService = async (query: any) => {
  const qb = productRepo.createQueryBuilder("product");

  // Handle Inventory if empty
  if (query.minInventory !== undefined) {
    qb.andWhere("product.inventory > :minInventory", {
      minInventory: Number(query.minInventory),
    });
  }

  Object.entries(query).forEach(([key, value]) => {
    if (typeof value !== "string") return;
    const cleanValue = value.trim();

    const match = key.match(/(price|inventory)_(gt|lt)/);
    if (match) {
      const [, field, operator] = match;
      const dbOpMap: Record<string, string> = {
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

    if (
      ["price", "inventory", "size"].includes(field) &&
      ["asc", "desc"].includes(direction)
    ) {
      qb.orderBy(`product.${field}`, direction.toUpperCase() as "ASC" | "DESC");
    }
  }

  // Get total count before pagination
  const total = await qb.getCount();

  // Apply pagination
  if (query.limit !== undefined) {
    qb.take(Number(query.limit));
  }
  if (query.offset !== undefined) {
    qb.skip(Number(query.offset));
  }

  const data = await qb.getMany();

  return { data, total };
};

//search by ID
export const getProductByIdService = async (id: number) => {
  return await productRepo.findOne({ where: { id } });
};

//Updating PRoduct detail
export const updateProductService = async (
  id: number,
  data: Partial<Product>
) => {
  const product = await productRepo.findOne({ where: { id } });
  if (!product) return null;

  productRepo.merge(product, data);
  return await productRepo.save(product);
};

//Delete the product
export const deleteProductService = async (id: number) => {
  const product = await productRepo.findOne({ where: { id } });
  if (!product) return null;

  await productRepo.remove(product);
  return product;
};
