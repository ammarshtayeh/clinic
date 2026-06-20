"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, Calendar, Stethoscope, FileText,
  Settings, LogOut, ClipboardList, UserCog, Smile,
} from "lucide-react";
import clsx from "clsx";
import { createClient } from "@/lib/supabase/client";
import { useClinic } from "@/lib/hooks/use-clinic";

const navItems = [
  { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/patients", label: "المرضى", icon: Users },
  { href: "/appointments", label: "المواعيد", icon: Calendar },
  { href: "/treatments", label: "العلاجات", icon: Stethoscope },
  { href: "/procedures", label: "الإجراءات", icon: ClipboardList },
  { href: "/invoices", label: "الفواتير", icon: FileText },
  { href: "/dental-chart", label: "المخطط السني", icon: Smile },
  { href: "/team", label: "الفريق", icon: UserCog },
  { href: "/settings", label: "الإعدادات", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { clinic } = useClinic();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col border-l border-slate-200/60 bg-white/80 backdrop-blur-xl">
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-700 text-white">
            <Smile size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{clinic?.name ?? "عيادة الأسنان"}</p>
            <p className="text-xs text-slate-400">نظام الإدارة</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-gradient-to-l from-cyan-500/10 to-cyan-600/5 text-cyan-700"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
        >
          <LogOut size={18} />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
