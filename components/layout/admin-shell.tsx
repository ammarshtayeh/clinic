"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, LayoutDashboard, LogOut, Shield, X } from "lucide-react";
import clsx from "clsx";
import { BRAND } from "@/lib/brand";
import { MockBanner } from "@/components/ui/mock-banner";

const navItems = [
  { href: "/admin", label: "لوحة المنصة", icon: LayoutDashboard },
  { href: "/admin/clinics", label: "العيادات", icon: Building2 },
];

function AdminSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/auth/admin-session", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <>
      <div className="border-b border-amber-500/10 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 shadow-lg shadow-amber-500/20">
            <Shield size={22} />
          </div>
          <div>
            <p className="text-sm font-black text-white">{BRAND.name}</p>
            <p className="text-[10px] font-semibold text-amber-400/80">Platform Admin</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-amber-600/60">المنصة</p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-amber-500/15 text-amber-300 shadow-[inset_3px_0_0_#f59e0b]"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-amber-500/10 p-4 space-y-2">
        <Link href="/login" className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-cyan-400/80 hover:bg-white/5">
          ← بوابة العيادة
        </Link>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-400 hover:bg-rose-500/10">
          <LogOut size={18} />
          تسجيل الخروج
        </button>
      </div>
    </>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#0a0f18]">
      <aside className="hidden h-screen w-72 shrink-0 flex-col border-l border-amber-500/10 bg-[#0d1117] lg:flex">
        <AdminSidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
          <aside className="absolute right-0 flex h-full w-72 flex-col bg-[#0d1117] shadow-2xl">
            <button onClick={() => setMobileOpen(false)} className="absolute left-4 top-4 text-slate-400"><X size={22} /></button>
            <AdminSidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-[1400px] p-4 md:p-8">
          <header className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-500/70">Asnany Platform</p>
              <p className="text-lg font-black text-white">إدارة المنصة</p>
            </div>
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-xl bg-amber-500/10 px-3 py-2 text-sm font-bold text-amber-400 lg:hidden"
            >
              القائمة
            </button>
          </header>
          <MockBanner />
          <div className="mt-4 animate-fade-in">{children}</div>
        </div>
      </main>
    </div>
  );
}
