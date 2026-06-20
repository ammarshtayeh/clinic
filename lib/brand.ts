export const BRAND = {
  name: "Asnany",
  domain: "asnany.ps",
  tagline: "نظام إدارة عيادات الأسنان",
  description: "منصة احترافية لإدارة عيادتك — مرضى، مواعيد، فواتير، ومخطط سني",
} as const;

export const ALLOW_REGISTRATION = process.env.NEXT_PUBLIC_ALLOW_REGISTRATION === "true";
