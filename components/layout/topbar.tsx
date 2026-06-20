"use client";

import { useClinic } from "@/lib/hooks/use-clinic";
import { ROLE_LABELS } from "@/lib/types/database";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export function Topbar() {
  const { profile, membership } = useClinic();
  const today = format(new Date(), "EEEE، d MMMM yyyy", { locale: ar });

  return (
    <header className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm text-slate-500">{today}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-left">
          <p className="text-sm font-semibold text-slate-800">{profile?.full_name}</p>
          {membership && (
            <p className="text-xs text-slate-400">{ROLE_LABELS[membership.role]}</p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 text-sm font-bold text-white">
          {profile?.full_name?.charAt(0) ?? "?"}
        </div>
      </div>
    </header>
  );
}
