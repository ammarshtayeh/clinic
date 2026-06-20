function hasValidSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!url || !key) return false;
  if (url.includes("placeholder") || url.includes("your-project")) return false;
  return true;
}

export function isMockMode(): boolean {
  if (process.env.NEXT_PUBLIC_MOCK_MODE === "true") return true;
  if (process.env.NEXT_PUBLIC_MOCK_MODE === "false" && hasValidSupabaseEnv()) return false;
  // Default to mock until Supabase is explicitly configured
  return true;
}

export const MOCK_SESSION_COOKIE = "ASNANY_MOCK_SESSION";
