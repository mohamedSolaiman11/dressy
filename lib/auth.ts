import "server-only";

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";
import { atelierProfile } from "@/lib/mock-data";

export async function getCurrentUser() {
  if (!hasSupabasePublicEnv()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
}

export async function requireAppUser() {
  if (!hasSupabasePublicEnv()) {
    return null;
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export function getUserDisplayName(user: User | null) {
  if (!user) {
    return atelierProfile.owner;
  }

  return (
    user.user_metadata.full_name ||
    user.user_metadata.name ||
    user.email ||
    atelierProfile.owner
  );
}
