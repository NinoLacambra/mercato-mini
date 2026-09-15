import { count, sum, sql } from "drizzle-orm";
import {
  CircleDollarSign,
  Package,
  ShoppingBag,
  TriangleAlert,
} from "lucide-react";

import { db } from "@/db";
import { orders, products } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [
    [orderStats],
    [productStats],
    [lowStockStats],
  ] = await Promise.all([
    db
      .select({
        totalOrders: count(),
        revenue: sum(orders.totalAmount),
      })
      .from(orders),

    db
      .select({
        totalProducts: count(),
      })
      .from(products),

    db
      .select({
        lowStock: count(),
      })
      .from(products)
      .where(sql`${products.stock} <= 5`),
  ]);

  const revenue = Number(orderStats.revenue ?? 0);

  const cards = [
    {
      label: "Revenue",
      value: `₱${revenue.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: CircleDollarSign,
    },
    {
      label: "Orders",
      value: orderStats.totalOrders,
      icon: ShoppingBag,
    },
    {
      label: "Products",
      value: productStats.totalProducts,
      icon: Package,
    },
    {
      label: "Low stock",
      value: lowStockStats.lowStock,
      icon: TriangleAlert,
    },
  ];

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-300">
            Mercato
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Manage your store, products, inventory, and orders.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-zinc-500">{card.label}</p>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05]">
                    <Icon className="h-4 w-4 text-zinc-300" />
                  </div>
                </div>

                <p className="mt-5 text-2xl font-semibold tracking-tight">
                  {card.value}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <a
            href="/admin/products"
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/20 hover:bg-white/[0.05]"
          >
            <Package className="h-6 w-6 text-violet-300" />

            <h2 className="mt-5 text-lg font-semibold">
              Product Management
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Add products, update prices and inventory, or remove products
              from the storefront.
            </p>

            <p className="mt-5 text-sm font-medium text-zinc-300 transition group-hover:text-white">
              Manage products →
            </p>
          </a>

          <a
            href="/admin/orders"
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/20 hover:bg-white/[0.05]"
          >
            <ShoppingBag className="h-6 w-6 text-blue-300" />

            <h2 className="mt-5 text-lg font-semibold">
              Orders
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Review customer orders, totals, dates, and fulfillment status.
            </p>

            <p className="mt-5 text-sm font-medium text-zinc-300 transition group-hover:text-white">
              View orders →
            </p>
          </a>
        </div>
      </div>
    </main>
  );
}