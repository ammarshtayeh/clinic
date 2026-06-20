"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Bell } from "lucide-react";
import { useClinic } from "@/lib/hooks/use-clinic";
import { ROLE_LABELS } from "@/lib/types/database";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { MobileMenuButton } from "@/components/layout/sidebar";
import { CommandSearch } from "@/components/layout/command-search";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { profile, membership } = useClinic();
  const [searchOpen, setSearchOpen] = useState(false);
  const today = format(new Date(), "EEEE، d MMMM yyyy", { locale: ar });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      setSearchOpen(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "صباح الخير" : hour < 17 ? "مساء الخير" : "مساء النور";

  return (
    <>
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MobileMenuButton onClick={onMenuClick} />
          <div>
            <p className="text-lg font-black text-slate-900">
              {greeting}{profile?.full_name ? `، ${profile.full_name.split(" ")[0]}` : ""} 👋
            </p>
            <p className="text-xs text-slate-400">{today}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-400 shadow-sm transition hover:border-cyan-300 hover:text-slate-600 sm:flex"
          >
            <Search size={16} />
            <span>بحث سريع...</span>
            <kbd className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">Ctrl+K</kbd>
          </button>

          <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm">
            <Bell size={18} />
          </button>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white py-1.5 pl-4 pr-1.5 shadow-sm">
            <div className="hidden text-left sm:block">
              <p className="text-sm font-bold text-slate-800">{profile?.full_name}</p>
              {membership && <p className="text-[10px] font-medium text-cyan-600">{ROLE_LABELS[membership.role]}</p>}
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 text-sm font-black text-white">
              {profile?.full_name?.charAt(0) ?? "?"}
            </div>
          </div>
        </div>
      </header>

      <CommandSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
