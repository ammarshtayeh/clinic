import type { MemberRole } from "@/lib/types/database";

export type Permission =
  | "dashboard"
  | "patients"
  | "appointments"
  | "calendar"
  | "treatments"
  | "procedures"
  | "invoices"
  | "dental_chart"
  | "reports"
  | "team"
  | "settings"
  | "admin";

const ROLE_PERMISSIONS: Record<MemberRole, Permission[]> = {
  owner: ["dashboard", "patients", "appointments", "calendar", "treatments", "procedures", "invoices", "dental_chart", "reports", "team", "settings"],
  doctor: ["dashboard", "patients", "appointments", "calendar", "treatments", "procedures", "dental_chart", "reports"],
  receptionist: ["dashboard", "patients", "appointments", "calendar"],
  accountant: ["dashboard", "patients", "invoices", "reports"],
};

export function canAccess(role: MemberRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getPermissions(role: MemberRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
