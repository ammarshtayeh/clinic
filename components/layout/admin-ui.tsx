"use client";

import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

export function AdminCard({
  children,
  className,
  title,
  subtitle,
  action,
  icon: Icon,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <div className={clsx("rounded-3xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur md:p-6", className)}>
      {(title || action) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <Icon size={18} />
              </span>
            )}
            <div>
              {title && <h2 className="text-base font-bold text-white">{title}</h2>}
              {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
            </div>
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function AdminKpi({
  label,
  value,
  icon: Icon,
  color,
  hint,
  trend,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  hint?: string;
  trend?: React.ReactNode;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur transition hover:border-white/10">
      <div
        className="absolute -left-6 -top-6 h-24 w-24 rounded-full opacity-20 blur-2xl transition group-hover:opacity-30"
        style={{ background: color }}
      />
      <div className="relative">
        <div className="mb-3 flex items-center justify-between">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-lg"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
          >
            <Icon size={20} />
          </span>
          {trend}
        </div>
        <p className="text-3xl font-black tracking-tight text-white">{value}</p>
        <p className="mt-1 text-sm text-slate-400">{label}</p>
        {hint && <p className="mt-0.5 text-[11px] text-slate-600">{hint}</p>}
      </div>
    </div>
  );
}

export function PlanPill({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold"
      style={{ background: `${color}22`, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
