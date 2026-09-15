import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  CircleDollarSign,
  PackageSearch,
  ShoppingBag,
} from "lucide-react";
import { count, lte, sql } from "drizzle-orm";

import { db } from "@/db";
import { orders, products } from "@/db/schema";
import { LogoutButton } from "@/components/admin/logout-button";

export const dynamic = "force-dynamic";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value);
}

export default async function AdminPage() {
  const [
    revenueResult,
    orderCountResult,
    productCountResult,
    lowStockResult,
  ] = await Promise.all([
    db
      .select({
        total: sql<string>`coalesce(sum(${orders.totalAmount}), 0)`,
      })
      .from(orders),

    db
      .select({
        count: count(),
      })
      .from(orders),

    db
      .select({
        count: count(),
      })
      .from(products),

    db
      .select({
        count: count(),
      })
      .from(products)
      .where(lte(products.stock, 5)),
  ]);

  const revenue = Number(
    revenueResult[0]?.total ?? 0
  );

  const orderCount =
    orderCountResult[0]?.count ?? 0;

  const productCount =
    productCountResult[0]?.count ?? 0;

  const lowStockCount =
    lowStockResult[0]?.count ?? 0;

  const stats = [
    {
      label: "Revenue",
      value: formatCurrency(revenue),
      description: "Total order value",
      icon: CircleDollarSign,
    },
    {
      label: "Orders",
      value: orderCount.toString(),
      description: "Customer orders",
      icon: ShoppingBag,
    },
    {
      label: "Products",
      value: productCount.toString(),
      description: "Products in catalog",
      icon: Boxes,
    },
    {
      label: "Low Stock",
      value: lowStockCount.toString(),
      description: "5 units or fewer",
      icon: PackageSearch,
    },
  ];

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-300">
              Mercato
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Admin Dashboard
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
              Manage your products, inventory, customer
              orders, and store activity.
            </p>
          </div>

          <LogoutButton />
        </div>

        {/* Stats */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-zinc-500">
                      {stat.label}
                    </p>

                    <p className="mt-2 text-2xl font-semibold tracking-tight">
                      {stat.value}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-zinc-400">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <p className="mt-4 text-xs text-zinc-600">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </section>

        {/* Management */}
        <section className="mt-10">
          <div>
            <p className="text-sm font-medium text-zinc-500">
              Store Management
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Manage Mercato
            </h2>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {/* Products */}
            <Link
              href="/admin/products"
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/20 hover:bg-white/[0.05]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                  <Boxes className="h-5 w-5" />
                </div>

                <ArrowRight className="h-5 w-5 text-zinc-700 transition group-hover:translate-x-1 group-hover:text-white" />
              </div>

              <h3 className="mt-6 text-lg font-semibold">
                Products
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
                Add products, update prices and inventory,
                edit product details, or remove products
                from the catalog.
              </p>

              <div className="mt-6 flex items-center gap-2 text-sm font-medium text-zinc-300">
                Manage products

                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>

            {/* Orders */}
            <Link
              href="/admin/orders"
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/20 hover:bg-white/[0.05]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                  <ShoppingBag className="h-5 w-5" />
                </div>

                <ArrowRight className="h-5 w-5 text-zinc-700 transition group-hover:translate-x-1 group-hover:text-white" />
              </div>

              <h3 className="mt-6 text-lg font-semibold">
                Orders
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
                Review customer orders, payment status,
                fulfillment progress, and update order
                statuses.
              </p>

              <div className="mt-6 flex items-center gap-2 text-sm font-medium text-zinc-300">
                Manage orders

                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          </div>
        </section>

        {/* Store link */}
        <div className="mt-10 border-t border-white/10 pt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
          >
            View storefront
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}