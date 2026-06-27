import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Add them to .env.local (see README).",
  );
}

/**
 * Read-only public client (uses the publishable key). Row-level security on the
 * project restricts this to the public-read tables; `audit_log` stays private.
 */
export const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
