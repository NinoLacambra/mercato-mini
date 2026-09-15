import { desc } from "drizzle-orm";

import { db } from "@/db";
import { products } from "@/db/schema";
import { ProductManager } from "@/components/admin/product-manager";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const productList = await db
    .select()
    .from(products)
    .orderBy(desc(products.createdAt));

  return <ProductManager products={productList} />;
}