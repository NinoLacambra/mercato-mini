"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  Lock,
  ShoppingBag,
} from "lucide-react";

import { useCart } from "@/components/cart/cart-provider";

export default function CheckoutPage() {
  const router = useRouter();

  const { items, total } = useCart();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/payments/paymongo",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerEmail: email,
            items: items.map((item) => ({
              productId: item.id,
              quantity: item.quantity,
            })),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to start payment."
        );
      }

      if (!data.checkoutUrl) {
        throw new Error(
          "Payment checkout URL was not returned."
        );
      }

      // Do NOT clear the cart here.
      // We have not confirmed payment yet.
      window.location.href = data.checkoutUrl;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );

      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back */}
        <button
          type="button"
          onClick={() => router.push("/")}
          disabled={loading}
          className="mb-8 flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to store
        </button>

        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          {/* Checkout Form */}
          <section>
            <div className="mb-8">
              <p className="text-sm font-medium text-violet-300">
                Checkout
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Complete your order
              </h1>

              <p className="mt-3 text-sm text-zinc-500">
                Enter your email and continue to our
                secure payment page.
              </p>
            </div>

            <form
              onSubmit={handleCheckout}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
                className="h-12 w-full rounded-xl border border-white/10 bg-zinc-950 px-4 text-sm outline-none transition placeholder:text-zinc-600 focus:border-violet-400/50 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              />

              <p className="mt-2 text-xs text-zinc-600">
                Your email will be associated with
                your order and payment.
              </p>

              {error && (
                <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  loading || items.length === 0
                }
                className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-zinc-950" />
                    Redirecting to payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />

                    Pay ₱
                    {total.toLocaleString(
                      "en-PH",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-600">
                <Lock className="h-3.5 w-3.5" />
                Secure payment powered by PayMongo
              </div>
            </form>
          </section>

          {/* Order Summary */}
          <aside className="h-fit rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-5 flex items-center gap-3">
              <ShoppingBag className="h-5 w-5" />

              <div>
                <h2 className="font-semibold">
                  Order summary
                </h2>

                <p className="text-xs text-zinc-500">
                  {items.length}{" "}
                  {items.length === 1
                    ? "product"
                    : "products"}
                </p>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 py-10 text-center">
                <ShoppingBag className="mx-auto h-6 w-6 text-zinc-700" />

                <p className="mt-3 text-sm text-zinc-500">
                  Your cart is empty.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/")
                  }
                  className="mt-4 text-sm font-medium text-violet-300 transition hover:text-violet-200"
                >
                  Return to store
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between gap-4 border-b border-white/10 pb-4"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {item.name}
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                          ₱
                          {Number(
                            item.price
                          ).toLocaleString(
                            "en-PH",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}{" "}
                          × {item.quantity}
                        </p>
                      </div>

                      <p className="shrink-0 text-sm">
                        ₱
                        {(
                          Number(item.price) *
                          item.quantity
                        ).toLocaleString(
                          "en-PH",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <span className="text-zinc-400">
                    Total
                  </span>

                  <span className="text-xl font-semibold">
                    ₱
                    {total.toLocaleString(
                      "en-PH",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </span>
                </div>
              </>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}