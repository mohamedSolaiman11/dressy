import "server-only";

import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";
import { atelierProfile } from "@/lib/mock-data";
import { getUserDisplayName } from "@/lib/auth";

export const ACTIVE_ATELIER_COOKIE = "active_atelier_id";

export type AppAtelier = {
  id: string;
  name: string;
  branchName: string;
  label: string;
  role: string;
};

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

type TenantContext = {
  supabase: SupabaseServerClient | null;
  user: User | null;
  ateliers: AppAtelier[];
  activeAtelier: AppAtelier | null;
  displayName: string;
};

type MembershipRow = {
  role: string;
  atelier: {
    id: string;
    name: string;
    branch_name: string | null;
  } | null;
};

async function loadTenantContext(): Promise<TenantContext> {
  if (!hasSupabasePublicEnv()) {
    return {
      supabase: null,
      user: null,
      ateliers: [],
      activeAtelier: null,
      displayName: atelierProfile.owner
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      supabase,
      user: null,
      ateliers: [],
      activeAtelier: null,
      displayName: atelierProfile.owner
    };
  }

  const { data, error } = await supabase
    .from("atelier_memberships")
    .select(
      `
        role,
        atelier:ateliers!atelier_memberships_atelier_id_fkey (
          id,
          name,
          branch_name
        )
      `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("تعذر تحميل فروع الأتيليه من Supabase.");
  }

  const ateliers = ((data ?? []) as MembershipRow[])
    .filter((row) => row.atelier)
    .map((row) => {
      const atelier = row.atelier as NonNullable<MembershipRow["atelier"]>;
      const label = atelier.branch_name
        ? `${atelier.name} - ${atelier.branch_name}`
        : atelier.name;

      return {
        id: atelier.id,
        name: atelier.name,
        branchName: atelier.branch_name ?? "",
        label,
        role: row.role
      } satisfies AppAtelier;
    });

  const cookieStore = await cookies();
  const activeAtelierId = cookieStore.get(ACTIVE_ATELIER_COOKIE)?.value;
  const activeAtelier =
    ateliers.find((atelier) => atelier.id === activeAtelierId) ?? ateliers[0] ?? null;

  return {
    supabase,
    user,
    ateliers,
    activeAtelier,
    displayName: getUserDisplayName(user)
  };
}

export async function getTenantContext() {
  const context = await loadTenantContext();

  if (hasSupabasePublicEnv() && !context.user) {
    redirect("/login");
  }

  return context;
}

export async function requireTenantContext() {
  const context = await getTenantContext();

  if (hasSupabasePublicEnv() && !context.activeAtelier) {
    redirect("/onboarding");
  }

  return context;
}

export async function getTenantApiContext() {
  return loadTenantContext();
}
