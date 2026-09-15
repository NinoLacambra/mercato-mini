"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  imageUrl: string | null;
};

type EditForm = {
  name: string;
  description: string;
  price: string;
  stock: string;
  imageUrl: string;
};

export function ProductManager({
  products,
}: {
  products: Product[];
}) {
  const router = useRouter();

  // Add product
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Edit product
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [editForm, setEditForm] = useState<EditForm>({
    name: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
  });

  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(
    null
  );
  const [error, setError] = useState("");

  async function handleCreate(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          price,
          stock,
          imageUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create product"
        );
      }

      setName("");
      setDescription("");
      setPrice("");
      setStock("");
      setImageUrl("");

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  function openEdit(product: Product) {
    setError("");

    setEditingProduct(product);

    setEditForm({
      name: product.name,
      description: product.description ?? "",
      price: product.price,
      stock: String(product.stock),
      imageUrl: product.imageUrl ?? "",
    });
  }

  function closeEdit() {
    if (updating) return;

    setEditingProduct(null);

    setEditForm({
      name: "",
      description: "",
      price: "",
      stock: "",
      imageUrl: "",
    });
  }

  async function handleUpdate(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!editingProduct) return;

    setUpdating(true);
    setError("");

    try {
      const response = await fetch("/api/products", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingProduct.id,
          name: editForm.name,
          description: editForm.description,
          price: editForm.price,
          stock: editForm.stock,
          imageUrl: editForm.imageUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update product"
        );
      }

      setEditingProduct(null);

      setEditForm({
        name: "",
        description: "",
        price: "",
        stock: "",
        imageUrl: "",
      });

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError("");

    try {
      const response = await fetch(`/api/products?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete product"
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
      setDeletingId(null);
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
            Inventory
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Product Management
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Add, edit, and manage your store inventory.
          </p>
        </div>

        {/* Error */}
        {error && !editingProduct && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="grid gap-8 xl:grid-cols-[380px_1fr]">
          {/* Add Product */}
          <section className="h-fit rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05]">
                <Plus className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-semibold">Add product</h2>

                <p className="text-xs text-zinc-500">
                  Create a new store item
                </p>
              </div>
            </div>

            <form
              onSubmit={handleCreate}
              className="space-y-4"
            >
              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Product name
                </label>

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Classic T-Shirt"
                  className="h-11 w-full rounded-xl border border-white/10 bg-zinc-950 px-4 text-sm outline-none transition focus:border-violet-400/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="Product description"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-violet-400/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-sm text-zinc-400">
                    Price
                  </label>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    placeholder="999"
                    className="h-11 w-full rounded-xl border border-white/10 bg-zinc-950 px-4 text-sm outline-none transition focus:border-violet-400/50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-400">
                    Stock
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                    placeholder="10"
                    className="h-11 w-full rounded-xl border border-white/10 bg-zinc-950 px-4 text-sm outline-none transition focus:border-violet-400/50"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Image URL
                </label>

                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="h-11 w-full rounded-xl border border-white/10 bg-zinc-950 px-4 text-sm outline-none transition focus:border-violet-400/50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />

                {loading ? "Adding..." : "Add product"}
              </button>
            </form>
          </section>

          {/* Products */}
          <section>
            <div className="mb-5">
              <h2 className="text-lg font-semibold">Products</h2>

              <p className="mt-1 text-sm text-zinc-500">
                {products.length}{" "}
                {products.length === 1
                  ? "product"
                  : "products"}
              </p>
            </div>

            {products.length === 0 ? (
              <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10">
                <Package className="h-8 w-8 text-zinc-700" />

                <p className="mt-4 text-sm text-zinc-500">
                  No products yet.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/10">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left">
                    <thead className="border-b border-white/10 bg-white/[0.03]">
                      <tr className="text-xs uppercase tracking-wider text-zinc-500">
                        <th className="px-5 py-4 font-medium">
                          Product
                        </th>

                        <th className="px-5 py-4 font-medium">
                          Price
                        </th>

                        <th className="px-5 py-4 font-medium">
                          Stock
                        </th>

                        <th className="px-5 py-4 text-right font-medium">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-white/10">
                      {products.map((product) => (
                        <tr
                          key={product.id}
                          className="transition hover:bg-white/[0.02]"
                        >
                          {/* Product */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-900">
                                {product.imageUrl ? (
                                  <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <Package className="h-4 w-4 text-zinc-600" />
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                  {product.name}
                                </p>

                                <p className="mt-1 max-w-xs truncate text-xs text-zinc-500">
                                  {product.description ||
                                    "No description"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Price */}
                          <td className="px-5 py-4 text-sm">
                            ₱
                            {Number(
                              product.price
                            ).toLocaleString("en-PH", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>

                          {/* Stock */}
                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                product.stock === 0
                                  ? "bg-red-500/10 text-red-300"
                                  : product.stock <= 5
                                    ? "bg-amber-500/10 text-amber-300"
                                    : "bg-emerald-500/10 text-emerald-300"
                              }`}
                            >
                              {product.stock}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  openEdit(product)
                                }
                                aria-label={`Edit ${product.name}`}
                                title="Edit product"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/5 hover:text-white"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(product.id)
                                }
                                disabled={
                                  deletingId === product.id
                                }
                                aria-label={`Delete ${product.name}`}
                                title="Delete product"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <button
            type="button"
            aria-label="Close edit modal"
            onClick={closeEdit}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-300">
                  Product #{editingProduct.id}
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  Edit product
                </h2>
              </div>

              <button
                type="button"
                onClick={closeEdit}
                disabled={updating}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/5 hover:text-white disabled:opacity-40"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleUpdate}
              className="space-y-4 p-6"
            >
              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Product name
                </label>

                <input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((current) => ({
                      ...current,
                      name: e.target.value,
                    }))
                  }
                  required
                  className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 text-sm outline-none transition focus:border-violet-400/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Description
                </label>

                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((current) => ({
                      ...current,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full resize-none rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-violet-400/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-sm text-zinc-400">
                    Price
                  </label>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm((current) => ({
                        ...current,
                        price: e.target.value,
                      }))
                    }
                    required
                    className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 text-sm outline-none transition focus:border-violet-400/50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-400">
                    Stock
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={editForm.stock}
                    onChange={(e) =>
                      setEditForm((current) => ({
                        ...current,
                        stock: e.target.value,
                      }))
                    }
                    required
                    className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 text-sm outline-none transition focus:border-violet-400/50"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Image URL
                </label>

                <input
                  type="url"
                  value={editForm.imageUrl}
                  onChange={(e) =>
                    setEditForm((current) => ({
                      ...current,
                      imageUrl: e.target.value,
                    }))
                  }
                  placeholder="https://..."
                  className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 text-sm outline-none transition focus:border-violet-400/50"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
                <button
                  type="button"
                  onClick={closeEdit}
                  disabled={updating}
                  className="h-10 rounded-xl border border-white/10 px-5 text-sm font-medium text-zinc-300 transition hover:bg-white/5 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updating}
                  className="flex h-10 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Pencil className="h-4 w-4" />

                  {updating ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}