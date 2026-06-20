"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, Calendar, Stethoscope, FileText,
  Settings, LogOut, ClipboardList, UserCog, Smile, BarChart3,
  CalendarDays, Shield, X, Menu,
} from "lucide-react";
import clsx from "clsx";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useClinic } from "@/lib/hooks/use-clinic";
import { canAccess, type Permission } from "@/lib/permissions";
import { BRAND } from "@/lib/brand";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  permission: Permission;
}

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "الرئيسية",
    items: [{ href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard, permission: "dashboard" }],
  },
  {
    title: "المرضى",
    items: [
      { href: "/patients", label: "قائمة المرضى", icon: Users, permission: "patients" },
      { href: "/dental-chart", label: "المخطط السني", icon: Smile, permission: "dental_chart" },
    ],
  },
  {
    title: "الجدولة",
    items: [
      { href: "/appointments", label: "المواعيد", icon: Calendar, permission: "appointments" },
      { href: "/appointments/calendar", label: "التقويم", icon: CalendarDays, permission: "calendar" },
    ],
  },
  {
    title: "العلاج",
    items: [
      { href: "/treatments", label: "العلاجات", icon: Stethoscope, permission: "treatments" },
      { href: "/procedures", label: "الإجراءات", icon: ClipboardList, permission: "procedures" },
    ],
  },
  {
    title: "المالية",
    items: [
      { href: "/invoices", label: "الفواتير", icon: FileText, permission: "invoices" },
      { href: "/reports", label: "التقارير", icon: BarChart3, permission: "reports" },
    ],
  },
  {
    title: "الإدارة",
    items: [
      { href: "/team", label: "الفريق", icon: UserCog, permission: "team" },
      { href: "/settings", label: "الإعدادات", icon: Settings, permission: "settings" },
    ],
  },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { clinic, membership, isSuperAdmin } = useClinic();
  const supabase = createClient();
  const role = membership?.role;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      <div className="border-b border-white/10 p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 text-sm font-black text-white">
            A
          </div>
          <div>
            <p className="text-sm font-black text-white">{BRAND.name}</p>
            <p className="text-[10px] text-slate-500">{BRAND.domain}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
          {clinic?.logo_url ? (
            <Image src={clinic.logo_url} alt="" width={40} height={40} className="h-10 w-10 rounded-xl object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white">
              <Smile size={18} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">{clinic?.name ?? "عيادتي"}</p>
            <p className="text-[10px] text-slate-500">عيادة نشطة</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto p-4">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter((item) => canAccess(role, item.permission));
          if (visibleItems.length === 0) return null;
          return (
            <div key={group.title}>
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">{group.title}</p>
              <div className="space-y-0.5">
                {visibleItems.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onNavigate}
                      className={clsx("sidebar-link", active && "sidebar-link-active")}
                    >
                      <Icon size={18} />
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}

        {isSuperAdmin && (
          <div>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-amber-600/80">المنصة</p>
            <Link href="/admin" onClick={onNavigate} className={clsx("sidebar-link text-amber-400", pathname.startsWith("/admin") && "sidebar-link-active")}>
              <Shield size={18} />
              إدارة Asnany
            </Link>
          </div>
        )}
      </nav>

      <div className="border-t border-white/10 p-4">
        <button onClick={handleLogout} className="sidebar-link w-full text-rose-400 hover:text-rose-300">
          <LogOut size={18} />
          تسجيل الخروج
        </button>
      </div>
    </>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden h-screen w-72 shrink-0 flex-col bg-slate-900 lg:flex">
      <SidebarContent />
    </aside>
  );
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute right-0 flex h-full w-72 flex-col bg-slate-900 shadow-2xl animate-slide-up">
        <button onClick={onClose} className="absolute left-4 top-4 text-slate-400"><X size={24} /></button>
        <SidebarContent onNavigate={onClose} />
      </aside>
    </div>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white lg:hidden">
      <Menu size={20} />
    </button>
  );
}
