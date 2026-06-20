"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useClinic } from "@/lib/hooks/use-clinic";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { loading } = useClinic();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-row">
      <Sidebar />
      <main className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(8,26,59,0.09),transparent_20%)]" />
        <div className="relative mx-auto max-w-[1400px] p-4 md:p-6 xl:p-8">
          <Topbar />
          <div className="mt-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
