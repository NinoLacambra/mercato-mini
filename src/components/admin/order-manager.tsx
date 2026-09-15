"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag } from "lucide-react";

type Order = {
  id: number;
  customerEmail: string;
  status: string;
  totalAmount: string;
  createdAt: Date;
};

const statuses = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "completed",
  "cancelled",
];

export function OrderManager({ orders }: { orders: Order[] }) {
  const router = useRouter();

  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function updateStatus(id: number, status: string) {
    setUpdatingId(id);
    setError("");

    try {
      const response = await fetch(`/api/orders/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update order status"
        );
      }

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function getStatusStyle(status: string) {
    switch (status) {
      case "paid":
        return "bg-emerald-500/10 text-emerald-300";

      case "completed":
        return "bg-green-500/10 text-green-300";

      case "shipped":
        return "bg-blue-500/10 text-blue-300";

      case "processing":
        return "bg-violet-500/10 text-violet-300";

      case "cancelled":
        return "bg-red-500/10 text-red-300";

      case "pending":
      default:
        return "bg-amber-500/10 text-amber-300";
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Back */}
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="mb-8 flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </button>

        {/* Header */}
        <div className="mb-10">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-300">
            Sales
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Orders
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Review customer purchases and manage fulfillment.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10">
            <ShoppingBag className="h-8 w-8 text-zinc-700" />

            <p className="mt-4 text-sm text-zinc-500">
              No orders yet.
            </p>
          </div>
        ) : (
          /* Orders Table */
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left">
                <thead className="border-b border-white/10 bg-white/[0.03]">
                  <tr className="text-xs uppercase tracking-wider text-zinc-500">
                    <th className="px-5 py-4 font-medium">
                      Order
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Customer
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Amount
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Date
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/10">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="transition hover:bg-white/[0.02]"
                    >
                      {/* Order ID */}
                      <td className="px-5 py-4">
                        <span className="text-sm font-medium">
                          #{order.id}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-zinc-300">
                          {order.customerEmail}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4">
                        <span className="text-sm font-medium">
                          ₱
                          {Number(
                            order.totalAmount
                          ).toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-zinc-400">
                          {new Date(
                            order.createdAt
                          ).toLocaleDateString("en-PH", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <select
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) =>
                            updateStatus(
                              order.id,
                              e.target.value
                            )
                          }
                          className={`h-9 cursor-pointer rounded-full border border-transparent px-3 text-xs font-medium capitalize outline-none transition disabled:cursor-not-allowed disabled:opacity-50 ${getStatusStyle(
                            order.status
                          )}`}
                        >
                          {statuses.map((status) => (
                            <option
                              key={status}
                              value={status}
                              className="bg-zinc-950 text-white"
                            >
                              {status.charAt(0).toUpperCase() +
                                status.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}