"use client";

import { useState } from "react";
import { Sidebar, MobileSidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { ClinicBlocked } from "@/components/layout/clinic-blocked";
import { useClinic } from "@/lib/hooks/use-clinic";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { loading, clinic, membership, isSuperAdmin } = useClinic();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600" />
          <p className="text-sm font-medium text-slate-500">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (clinic && !clinic.is_active && !isSuperAdmin) {
    return <ClinicBlocked />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-[1440px] p-4 md:p-6 lg:p-8">
          <Topbar onMenuClick={() => setMobileOpen(true)} />
          <div className="mt-6 animate-fade-in">{children}</div>
        </div>
      </main>
    </div>
  );
}
