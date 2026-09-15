import Link from "next/link";
import {
  CheckCircle2,
  ShoppingBag,
} from "lucide-react";

export default function PaymentSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle2 className="h-7 w-7 text-emerald-400" />
        </div>

        <p className="mt-6 text-sm font-medium uppercase tracking-[0.2em] text-emerald-300">
          Payment complete
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Thank you for your order
        </h1>

        <p className="mt-4 text-sm leading-6 text-zinc-500">
          Your payment has been submitted successfully.
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
        >
          <ShoppingBag className="h-4 w-4" />
          Return to store
        </Link>
      </div>
    </main>
  );
}