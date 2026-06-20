export function isMockMode(): boolean {
  if (process.env.NEXT_PUBLIC_MOCK_MODE === "true") return true;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!url || !key) return true;
  if (url.includes("placeholder") || url.includes("your-project")) return true;
  return false;
}

export const MOCK_SESSION_COOKIE = "ASNANY_MOCK_SESSION";
