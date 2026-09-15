import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function getAdminUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const adminEmail =
    process.env.ADMIN_EMAIL?.trim().toLowerCase();

  const userEmail =
    user.email?.trim().toLowerCase();

  if (
    !adminEmail ||
    !userEmail ||
    userEmail !== adminEmail
  ) {
    return null;
  }

  return user;
}

export async function requireAdmin() {
  const user = await getAdminUser();

  if (!user) {
    redirect("/admin/login");
  }

  return user;
}

export async function isAdmin() {
  const user = await getAdminUser();

  return Boolean(user);
}