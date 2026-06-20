import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/components/ui/app-providers";

export const metadata: Metadata = {
  title: {
    default: "نظام إدارة عيادات الأسنان",
    template: "%s | نظام إدارة عيادات الأسنان",
  },
  description: "واجهة إدارة عيادات أسنان متعددة الفروع",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
