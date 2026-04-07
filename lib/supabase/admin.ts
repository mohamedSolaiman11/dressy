import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { assertSupabaseServiceRoleEnv } from "@/lib/supabase/env";

export function createSupabaseAdminClient() {
  const { supabaseUrl, supabaseServiceRoleKey } = assertSupabaseServiceRoleEnv();

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
