import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    order?: string;
  }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle2 className="h-7 w-7 text-emerald-400" />
        </div>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight">
          Order placed
        </h1>

        <p className="mt-3 text-sm leading-6 text-zinc-500">
          Your order has been created successfully.
        </p>

        {params.order && (
          <p className="mt-4 text-sm text-zinc-400">
            Order #{params.order}
          </p>
        )}

        <Link
          href="/"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
        >
          Continue shopping
        </Link>
      </div>
    </main>
  );
}