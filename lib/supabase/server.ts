import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isMockMode, MOCK_SESSION_COOKIE } from "@/lib/mock/config";

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing Supabase environment variables");
  return { url, key };
}

export async function createClient() {
  if (isMockMode()) {
    return null;
  }
  const { url, key } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Component
        }
      },
    },
  });
}

export async function createAdminClient() {
  if (isMockMode()) return null;
  const { url } = getSupabaseEnv();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
  return createSupabaseClient(url, serviceKey);
}

export async function getMockSessionUserId() {
  if (!isMockMode()) return null;
  const cookieStore = await cookies();
  return cookieStore.get(MOCK_SESSION_COOKIE)?.value ?? null;
}
