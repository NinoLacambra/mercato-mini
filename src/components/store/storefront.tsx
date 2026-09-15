"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Minus,
  Package,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";

import { useCart } from "@/components/cart/cart-provider";

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  imageUrl: string | null;
};

export function Storefront({ products }: { products: Product[] }) {
  const router = useRouter();
  const [cartOpen, setCartOpen] = useState(false);

  const {
    items,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    itemCount,
    total,
  } = useCart();

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-zinc-950">
              <ShoppingBag className="h-5 w-5" />
            </div>

            <div>
              <h1 className="font-semibold tracking-tight">Mercato</h1>
              <p className="text-xs text-zinc-500">Modern essentials</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label="Open cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] transition hover:bg-white/[0.08]"
          >
            <ShoppingCart className="h-5 w-5" />

            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-zinc-950">
              {itemCount}
            </span>
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-violet-300">
            Mercato Collection
          </p>

          <h2 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Simple products.
            <span className="block text-zinc-500">
              Thoughtfully selected.
            </span>
          </h2>

          <p className="mt-6 max-w-xl text-base leading-7 text-zinc-400">
            Discover everyday essentials selected for quality, comfort, and
            modern living.
          </p>
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            Our products
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            {products.length}{" "}
            {products.length === 1 ? "product" : "products"} available
          </p>
        </div>

        {products.length === 0 ? (
          <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05]">
              <Package className="h-5 w-5 text-zinc-400" />
            </div>

            <h3 className="font-medium">No products yet</h3>

            <p className="mt-2 max-w-sm text-sm text-zinc-500">
              Products added to the Mercato catalog will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <article
                key={product.id}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:-translate-y-1 hover:border-white/20"
              >
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden bg-zinc-900">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package className="h-10 w-10 text-zinc-700" />
                    </div>
                  )}

                  {product.stock === 0 && (
                    <div className="absolute left-3 top-3 rounded-full bg-zinc-950/90 px-3 py-1 text-xs font-medium">
                      Sold out
                    </div>
                  )}
                </div>

                {/* Product Information */}
                <div className="p-5">
                  <h3 className="font-medium">{product.name}</h3>

                  <p className="mt-2 line-clamp-2 min-h-10 text-sm text-zinc-500">
                    {product.description || "No description available."}
                  </p>

                  <div className="mt-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold">
                        ₱
                        {Number(product.price).toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        {product.stock > 0
                          ? `${product.stock} in stock`
                          : "Out of stock"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      className="flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-10 border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© 2026 Mercato Mini</p>
          <p>Full-stack e-commerce demo</p>
        </div>
      </footer>

      {/* Cart Drawer */}
      {cartOpen && (
        <>
          {/* Overlay */}
          <button
            type="button"
            aria-label="Close cart"
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 z-40 bg-black/60"
          />

          {/* Drawer */}
          <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-zinc-950 shadow-2xl">
            {/* Cart Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <h2 className="text-lg font-semibold">Your cart</h2>

                <p className="text-sm text-zinc-500">
                  {itemCount} item{itemCount === 1 ? "" : "s"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCartOpen(false)}
                aria-label="Close cart"
                className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-5">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <ShoppingCart className="mb-4 h-10 w-10 text-zinc-700" />

                  <p className="font-medium">Your cart is empty</p>

                  <p className="mt-2 text-sm text-zinc-500">
                    Add a product to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                    >
                      <div className="flex justify-between gap-4">
                        <div>
                          <p className="font-medium">{item.name}</p>

                          <p className="mt-1 text-sm text-zinc-500">
                            ₱
                            {Number(item.price).toLocaleString("en-PH", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          aria-label={`Remove ${item.name}`}
                          className="text-zinc-500 transition hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        {/* Quantity */}
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => decreaseQuantity(item.id)}
                            aria-label={`Decrease ${item.name} quantity`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 transition hover:bg-white/5"
                          >
                            <Minus className="h-3 w-3" />
                          </button>

                          <span className="w-5 text-center text-sm">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => increaseQuantity(item.id)}
                            disabled={item.quantity >= item.stock}
                            aria-label={`Increase ${item.name} quantity`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Line Total */}
                        <p className="font-medium">
                          ₱
                          {(
                            Number(item.price) * item.quantity
                          ).toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>

                      {item.quantity >= item.stock && (
                        <p className="mt-3 text-xs text-amber-400">
                          Maximum available stock reached.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            <div className="border-t border-white/10 p-5">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-zinc-400">Total</span>

                <span className="text-xl font-semibold">
                  ₱
                  {total.toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCartOpen(false);
                  router.push("/checkout");
                }}
                disabled={items.length === 0}
                className="h-12 w-full rounded-xl bg-white font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Checkout
              </button>
            </div>
          </aside>
        </>
      )}
    </main>
  );
}