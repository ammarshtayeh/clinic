import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  isMockMode, MOCK_SESSION_COOKIE, ADMIN_SESSION_COOKIE,
} from "@/lib/mock/config";
import { isAdminUser } from "@/lib/mock/seed";
import {
  isAdminProtected, isClinicProtected, isPublicPath,
} from "@/lib/auth/portals";

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
  const clinicUserId = request.cookies.get(MOCK_SESSION_COOKIE)?.value;
  const adminUserId = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  // Clinic sessions are presence-based so admin-provisioned clinic accounts work too.
  const hasClinicSession = !!clinicUserId && !isAdminUser(clinicUserId);
  const hasAdminSession = isAdminUser(adminUserId);

  if (!ALLOW_REGISTRATION && pathname.startsWith("/register")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/admin/login") {
    if (hasAdminSession) return NextResponse.redirect(new URL("/admin", request.url));
    return NextResponse.next({ request });
  }

  if (pathname === "/login") {
    if (hasClinicSession) return NextResponse.redirect(new URL("/dashboard", request.url));
    return NextResponse.next({ request });
  }

  if (isAdminProtected(pathname)) {
    if (!hasAdminSession) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next({ request });
  }

  if (isClinicProtected(pathname)) {
    if (!hasClinicSession) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next({ request });
  }

  if (pathname === "/" || isPublicPath(pathname)) {
    return NextResponse.next({ request });
  }

  if (!hasClinicSession && !hasAdminSession) {
    return NextResponse.redirect(new URL("/login", request.url));
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
      pathname.startsWith("/admin/login") ||
      pathname.startsWith("/register") ||
      pathname.startsWith("/forgot-password") ||
      pathname.startsWith("/reset-password");
    const isPublic =
      isAuthPage ||
      pathname === "/" ||
      pathname.startsWith("/auth") ||
      pathname.startsWith("/api");

    if (!ALLOW_REGISTRATION && pathname.startsWith("/register")) {
      return NextResponse.redirect(new URL("/login", request.url));
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

    if (isAdminProtected(pathname)) {
      if (!user) return NextResponse.redirect(new URL("/admin/login", request.url));
      const { data: profile } = await supabase.from("profiles").select("is_super_admin").eq("id", user.id).maybeSingle();
      if (!profile?.is_super_admin) return NextResponse.redirect(new URL("/dashboard", request.url));
      return supabaseResponse;
    }

    if (!user && isClinicProtected(pathname)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (user && (pathname === "/login" || pathname === "/admin/login")) {
      const { data: profile } = await supabase.from("profiles").select("is_super_admin").eq("id", user.id).maybeSingle();
      if (pathname === "/admin/login" && profile?.is_super_admin) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (!user && !isPublic) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return supabaseResponse;
  } catch (err) {
    console.error("[middleware] unhandled error:", err);
    return NextResponse.next({ request });
  }
}
