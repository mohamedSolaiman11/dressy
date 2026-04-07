export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function hasSupabasePublicEnv() {
  return Boolean(supabaseUrl && supabasePublishableKey);
}

export function hasSupabaseServiceRoleEnv() {
  return Boolean(supabaseUrl && supabaseServiceRoleKey);
}

export function assertSupabasePublicEnv() {
  if (!hasSupabasePublicEnv()) {
    throw new Error(
      "Supabase public environment variables are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    );
  }

  return {
    supabaseUrl: supabaseUrl as string,
    supabasePublishableKey: supabasePublishableKey as string
  };
}

export function assertSupabaseServiceRoleEnv() {
  if (!hasSupabaseServiceRoleEnv()) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is missing. Add it to .env.local to enable server-side writes."
    );
  }

  return {
    supabaseUrl: supabaseUrl as string,
    supabaseServiceRoleKey: supabaseServiceRoleKey as string
  };
}
