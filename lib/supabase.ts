// Supabase client (optional for MVP — Memory falls back to localStorage). Owned by Session 1.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;
if (url && anon) {
  client = createClient(url, anon);
}

/** Returns the Supabase client, or null if env isn't configured (MVP runs without it). */
export function supabase(): SupabaseClient | null {
  return client;
}
