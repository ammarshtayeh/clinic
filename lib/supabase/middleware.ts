import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isMockMode, MOCK_SESSION_COOKIE } from "@/lib/mock/config";
import { MOCK_CREDENTIALS } from "@/lib/mock/seed";

const ALLOW_REGISTRATION = process.env.NEXT_PUBLIC_ALLOW_REGISTRATION === "true";

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("placeholder") || url.includes("your-project")) {
    return null;
  }
  return { url, key };
}

function handleMockSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");
  const isPublic =
    isAuthPage ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api");

  if (!ALLOW_REGISTRATION && pathname.startsWith("/register")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const sessionUserId = request.cookies.get(MOCK_SESSION_COOKIE)?.value;
  const user = sessionUserId ? MOCK_CREDENTIALS.find((c) => c.userId === sessionUserId) : null;

  if (!user && !isPublic && pathname !== "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (user && pathname.startsWith("/admin") && user.userId !== "user-owner-001") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request });
}

export async function updateSession(request: NextRequest) {
  try {
    if (isMockMode()) {
      return handleMockSession(request);
    }

    const { pathname } = request.nextUrl;

    const isAuthPage =
      pathname.startsWith("/login") ||
      pathname.startsWith("/register") ||
      pathname.startsWith("/forgot-password") ||
      pathname.startsWith("/reset-password");
    const isPublic =
      isAuthPage ||
      pathname.startsWith("/auth") ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api");

    if (!ALLOW_REGISTRATION && pathname.startsWith("/register")) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    const env = getSupabaseEnv();
    if (!env) {
      return handleMockSession(request);
    }

    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(env.url, env.key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    const authResult = await Promise.race([
      supabase.auth.getUser(),
      new Promise<{ data: { user: null }; error: { message: string } }>((resolve) =>
        setTimeout(() => resolve({ data: { user: null }, error: { message: "Auth timeout" } }), 4000)
      ),
    ]);
    const user = authResult.data?.user ?? null;
    if (authResult.error && authResult.error.message !== "Auth timeout") {
      console.error("[middleware] getUser error:", authResult.error.message);
    }

    if (!user && !isPublic && pathname !== "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    if (user && isAuthPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    if (user && pathname.startsWith("/admin")) {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_super_admin")
          .eq("id", user.id)
          .maybeSingle();
        if (!profile?.is_super_admin) {
          const url = request.nextUrl.clone();
          url.pathname = "/dashboard";
          return NextResponse.redirect(url);
        }
      } catch {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
    }

    return supabaseResponse;
  } catch (err) {
    console.error("[middleware] unhandled error:", err);
    return NextResponse.next({ request });
  }
}
