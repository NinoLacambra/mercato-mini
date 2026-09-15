import Link from "next/link";
import {
  CheckCircle2,
  ShoppingBag,
} from "lucide-react";

import { PaymentSuccessClient } from "./payment-success-client";

type PaymentSuccessPageProps = {
  searchParams: Promise<{
    order?: string;
  }>;
};

export default async function PaymentSuccessPage({
  searchParams,
}: PaymentSuccessPageProps) {
  const { order } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12 text-white">
      <PaymentSuccessClient />

      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>

        <p className="mt-6 text-sm font-medium uppercase tracking-[0.2em] text-emerald-300">
          Payment successful
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Thank you for your order
        </h1>

        <p className="mt-4 text-sm leading-6 text-zinc-500">
          Your payment was processed securely through
          PayMongo.
        </p>

        {order && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-950 p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-600">
              Order
            </p>

            <p className="mt-1 font-medium text-zinc-200">
              #{order}
            </p>
          </div>
        )}

        <Link
          href="/"
          className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white font-semibold text-zinc-950 transition hover:bg-zinc-200"
        >
          <ShoppingBag className="h-4 w-4" />
          Continue shopping
        </Link>
      </div>
    </main>
  );
}