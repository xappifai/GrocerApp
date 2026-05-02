/**
 * Validates that required Supabase environment variables are present.
 * Throws a clear, actionable error at module-load time instead of a cryptic
 * crash deep inside the Supabase client when a value is undefined.
 *
 * IMPORTANT: Next.js only statically inlines NEXT_PUBLIC_* vars when the key
 * is a literal string (process.env.NEXT_PUBLIC_FOO), NOT a dynamic lookup
 * (process.env[name]). Each var must be read with its literal name here.
 *
 * Imported by lib/supabase/server.ts, client.ts, and middleware.ts.
 */

const _url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const _key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!_url) {
  throw new Error(
    "Missing environment variable: NEXT_PUBLIC_SUPABASE_URL\n" +
    "Copy .env.example to .env.local and fill in your Supabase credentials.\n" +
    "See: https://supabase.com/dashboard/project/_/settings/api"
  );
}

if (!_key) {
  throw new Error(
    "Missing environment variable: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY\n" +
    "Copy .env.example to .env.local and fill in your Supabase credentials.\n" +
    "See: https://supabase.com/dashboard/project/_/settings/api"
  );
}

export const SUPABASE_URL: string = _url;
export const SUPABASE_KEY: string = _key;
