import { Role } from "@/lib/types";

export type AppAction =
  | "appointments.create"
  | "appointments.checkIn"
  | "appointments.complete"
  | "patients.create"
  | "dental.write"
  | "admin.users.manage"
  | "admin.treatments.manage"
  | "billing.manage"
  | "admin.audit.view";

const routePolicy: Array<{ prefix: string; allowed: Role[] }> = [
  { prefix: "/admin/roles", allowed: ["admin"] },
  { prefix: "/admin/audit", allowed: ["admin"] },
  { prefix: "/admin/treatments", allowed: ["admin"] },
  { prefix: "/admin/users", allowed: ["admin"] },
  { prefix: "/admin", allowed: ["admin"] },
  {
    prefix: "/billing",
    allowed: ["admin", "receptionist", "accountant"],
  },
  {
    prefix: "/reports",
    allowed: ["admin", "branchManager", "accountant", "receptionist"],
  },
  { prefix: "/branches", allowed: ["admin"] },
  { prefix: "/doctors", allowed: ["admin", "receptionist"] },
  {
    prefix: "/appointments",
    allowed: ["admin", "doctor", "receptionist"],
  },
  {
    prefix: "/patient-care",
    allowed: ["admin", "doctor", "receptionist"],
  },
  {
    prefix: "/dental-chart",
    allowed: ["admin", "doctor"],
  },
];

const actionPolicy: Record<AppAction, Role[]> = {
  "appointments.create": ["admin", "receptionist", "doctor"],
  "appointments.checkIn": ["admin", "receptionist"],
  "appointments.complete": ["admin", "doctor", "receptionist"],
  "patients.create": ["admin", "receptionist"],
  "dental.write": ["admin", "doctor"],
  "admin.users.manage": ["admin"],
  "admin.treatments.manage": ["admin"],
  "billing.manage": ["admin", "receptionist", "accountant"],
  "admin.audit.view": ["admin"],
};

export const canAccessRoute = (role: Role, path: string) => {
  const matched = routePolicy.find((item) => path.startsWith(item.prefix));
  if (!matched) {
    return true;
  }
  return matched.allowed.includes(role);
};

export const canDoAction = (role: Role, action: AppAction) => {
  return actionPolicy[action].includes(role);
};
