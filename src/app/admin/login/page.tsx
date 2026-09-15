"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Store,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error(
          "Unable to authenticate."
        );
      }

      /*
       * This is only a UX check.
       *
       * We'll enforce ADMIN_EMAIL securely
       * on the server in the next step.
       */
      if (
        data.user.email?.toLowerCase() !==
        process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase()
      ) {
        await supabase.auth.signOut();

        throw new Error(
          "This account does not have admin access."
        );
      }

      router.replace("/admin");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to sign in."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4 py-12 text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-200px] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back to store */}
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mb-6 flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to store
        </button>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur">
          {/* Logo */}
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-zinc-950">
            <Store className="h-6 w-6" />
          </div>

          <p className="mt-7 text-sm font-medium uppercase tracking-[0.2em] text-violet-300">
            Mercato
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Admin login
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-500">
            Sign in to manage products, inventory,
            payments, and customer orders.
          </p>

          <form
            onSubmit={handleLogin}
            className="mt-8 space-y-5"
          >
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                disabled={loading}
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="admin@example.com"
                className="h-12 w-full rounded-xl border border-white/10 bg-zinc-950 px-4 text-sm outline-none transition placeholder:text-zinc-700 focus:border-violet-400/50 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-50"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  placeholder="Enter your password"
                  className="h-12 w-full rounded-xl border border-white/10 bg-zinc-950 px-4 pr-12 text-sm outline-none transition placeholder:text-zinc-700 focus:border-violet-400/50 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-50"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current
                    )
                  }
                  className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-zinc-600 transition hover:text-white"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LockKeyhole className="h-4 w-4" />

              {loading
                ? "Signing in..."
                : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}