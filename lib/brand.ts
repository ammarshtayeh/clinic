export const BRAND = {
  name: "Asnany",
  domain: "asnany.ps",
  tagline: "نظام إدارة عيادات الأسنان",
  description: "منصة احترافية لإدارة عيادتك — مرضى، مواعيد، فواتير، ومخطط سني",
  clinicPortal: {
    title: "بوابة العيادة",
    subtitle: "للأطباء والموظفين — إدارة يومية للمرضى والمواعيد",
  },
  adminPortal: {
    title: "بوابة المنصة",
    subtitle: "مدير النظام — بيع الاشتراكات والمقاعد للعيادات",
  },
} as const;

export const ALLOW_REGISTRATION = process.env.NEXT_PUBLIC_ALLOW_REGISTRATION === "true";

export const MOCK_ACCOUNTS = {
  owner: { email: "owner@asnany.ps", password: "ammarking123", label: "مالك العيادة" },
  doctor: { email: "ammar.ammar@gmail.com", password: "ammarking123", label: "طبيب" },
  admin: { email: "ammar.shtayeh@gmail.com", password: "ammarking123", label: "مدير النظام" },
} as const;
