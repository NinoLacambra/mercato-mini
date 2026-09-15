"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  PackageCheck,
  ShoppingBag,
} from "lucide-react";

import { useCart } from "@/components/cart/cart-provider";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();

  const orderId = searchParams.get("order");

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12 text-white">
      <div className="w-full max-w-lg">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>

          <p className="mt-6 text-sm font-medium uppercase tracking-[0.2em] text-emerald-300">
            Payment successful
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Thank you for your order
          </h1>

          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-zinc-500">
            Your payment was submitted successfully and
            your order is being processed.
          </p>

          {orderId && (
            <div className="mt-7 rounded-2xl border border-white/10 bg-zinc-950 p-5">
              <div className="flex items-center justify-center gap-3">
                <PackageCheck className="h-5 w-5 text-violet-300" />

                <div className="text-left">
                  <p className="text-xs uppercase tracking-wider text-zinc-600">
                    Order number
                  </p>

                  <p className="mt-1 font-semibold">
                    #{orderId}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Link
            href="/"
            className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
          >
            <ShoppingBag className="h-4 w-4" />
            Continue shopping
          </Link>

          <div className="mt-6 border-t border-white/10 pt-6">
            <p className="text-xs leading-5 text-zinc-600">
              Payment processed securely through PayMongo.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}