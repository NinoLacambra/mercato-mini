"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);

    try {
      const supabase = createClient();

      await supabase.auth.signOut();

      router.replace("/admin/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm font-medium text-zinc-400 transition hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      <LogOut className="h-4 w-4" />

      {loading ? "Signing out..." : "Logout"}
    </button>
  );
}