import { NextRequest, NextResponse } from "next/server";
import { isMockMode, ADMIN_SESSION_COOKIE } from "@/lib/mock/config";
import { ADMIN_CREDENTIALS, isAdminUser } from "@/lib/mock/seed";

const COOKIE_OPTS = {
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  httpOnly: false,
};

export async function POST(request: Request) {
  if (!isMockMode()) {
    return NextResponse.json({ error: "Admin mock auth not enabled" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const { email, password } = body as { email?: string; password?: string };

  if (!email || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  const cred = ADMIN_CREDENTIALS.find((c) => c.email === email && c.password === password);
  if (!cred) {
    return NextResponse.json({ error: "Unauthorized — platform admin only" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, userId: cred.userId });
  response.cookies.set(ADMIN_SESSION_COOKIE, cred.userId, COOKIE_OPTS);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", { ...COOKIE_OPTS, maxAge: 0 });
  return response;
}

export async function GET(request: NextRequest) {
  if (!isMockMode()) return NextResponse.json({ user: null });
  const userId = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!isAdminUser(userId)) return NextResponse.json({ user: null });
  const cred = ADMIN_CREDENTIALS.find((c) => c.userId === userId);
  return NextResponse.json({
    user: cred ? { id: cred.userId, email: cred.email, full_name: "مدير النظام", is_super_admin: true } : null,
  });
}
