import { desc } from "drizzle-orm";

import { db } from "@/db";
import { orders } from "@/db/schema";
import { OrderManager } from "@/components/admin/order-manager";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orderList = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt));

  return <OrderManager orders={orderList} />;
}