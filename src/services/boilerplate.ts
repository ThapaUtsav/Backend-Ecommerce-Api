export const getOrdersByUser = async ({
  userId,
  limit,
  offset,
}: {
  userId: string | number;
  limit?: number;
  offset?: number;
}) => {
  const qb = orderRepo
    .createQueryBuilder("order")
    .leftJoinAndSelect("order.items", "items")
    .leftJoinAndSelect("items.product", "product")
    .where("order.userId = :userId", { userId })
    .orderBy("order.created_at", "DESC");

  if (limit !== undefined) {
    qb.take(Number(limit));
  }

  if (offset !== undefined) {
    qb.skip(Number(offset));
  }

  const [orders, total] = await qb.getManyAndCount();

  return { orders, total };
};
