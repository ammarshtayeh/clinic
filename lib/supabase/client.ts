import { createBrowserClient } from "@supabase/ssr";
import { isMockMode } from "@/lib/mock/config";
import { createMockClient } from "@/lib/mock/client";

type BrowserClient = ReturnType<typeof createBrowserClient>;

let browserClient: BrowserClient | null = null;
let mockClient: BrowserClient | null = null;

export function createClient(): BrowserClient {
  if (isMockMode()) {
    if (!mockClient) {
      mockClient = createMockClient() as unknown as BrowserClient;
    }
    return mockClient;
  }

  if (!browserClient) {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key"
    );
  }
  return browserClient;
}

export function isUsingMockData() {
  return isMockMode();
}
