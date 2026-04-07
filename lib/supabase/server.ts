import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/database.types";
import { assertSupabasePublicEnv } from "@/lib/supabase/env";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { supabaseUrl, supabasePublishableKey } = assertSupabasePublicEnv();
  const mutableCookieStore = cookieStore as unknown as {
    set: (name: string, value: string, options?: Record<string, unknown>) => void;
  };

  return createServerClient<Database>(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            mutableCookieStore.set(name, value, options);
          });
        } catch {
          // Server Components may not be able to set cookies during render.
        }
      }
    }
  });
}
