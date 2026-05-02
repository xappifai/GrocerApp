import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { SUPABASE_URL, SUPABASE_KEY } from "./env";

/**
 * Cookie-free Supabase client for build-time operations (generateStaticParams,
 * generateMetadata at build). The regular createClient() calls cookies() which
 * requires a live request scope and throws during `next build`.
 */
export function createStaticClient() {
  return createSupabaseClient(SUPABASE_URL, SUPABASE_KEY);
}

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — session refresh is handled by middleware
        }
      },
    },
  });
}
