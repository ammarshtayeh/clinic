import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/mock/config";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code && !isMockMode()) {
    const supabase = await createClient();
    if (supabase) await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
