/** Portal routing & path helpers */

export type Portal = "clinic" | "admin";

export const CLINIC_PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export const ADMIN_PUBLIC_PATHS = ["/admin/login"];

export const CLINIC_PROTECTED_PREFIXES = [
  "/dashboard",
  "/patients",
  "/appointments",
  "/treatments",
  "/procedures",
  "/invoices",
  "/dental-chart",
  "/reports",
  "/team",
  "/settings",
];

export function isClinicProtected(pathname: string): boolean {
  return CLINIC_PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function isAdminProtected(pathname: string): boolean {
  return pathname === "/admin" || (pathname.startsWith("/admin/") && !pathname.startsWith("/admin/login"));
}

export function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  if (CLINIC_PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return true;
  if (ADMIN_PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return true;
  if (pathname.startsWith("/auth")) return true;
  if (pathname.startsWith("/api")) return true;
  return false;
}

export const OWNER_ID = "user-owner-001";
