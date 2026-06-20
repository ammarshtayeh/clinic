import { createBrowserClient } from "@supabase/ssr";
import { isMockMode } from "@/lib/mock/config";
import { createMockClient } from "@/lib/mock/client";

export function createClient() {
  if (isMockMode()) {
    return createMockClient() as unknown as ReturnType<typeof createBrowserClient>;
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key"
  );
}

export function isUsingMockData() {
  return isMockMode();
}
