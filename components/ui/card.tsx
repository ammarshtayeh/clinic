import clsx from "clsx";

export function Card({ children, className, title, action, dark }: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div className={clsx(dark ? "premium-card-dark" : "premium-card", className)}>
      {(title || action) && (
        <div className="mb-5 flex items-center justify-between gap-4">
          {title && <h2 className={clsx("text-lg font-bold", dark ? "text-white" : "text-slate-800")}>{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function StatCard({ label, value, icon, glow }: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  glow?: string;
}) {
  return (
    <div className="stat-glow premium-card flex items-center gap-4" style={{ "--glow-color": glow ?? "#06b6d4" } as React.CSSProperties}>
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
        style={{ background: `linear-gradient(135deg, ${glow ?? "#06b6d4"}, ${glow ? glow : "#0891b2"})` }}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-3xl font-black tracking-tight text-slate-900">{value}</p>
      </div>
    </div>
  );
}

export function EmptyState({ title, description, action, icon }: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {icon && <div className="mb-4 text-slate-300">{icon}</div>}
      <p className="text-xl font-bold text-slate-700">{title}</p>
      {description && <p className="mt-2 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}

export function PageHeader({ title, description, action, badge, dark }: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  badge?: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <h1 className={clsx("text-2xl font-black tracking-tight md:text-3xl", dark ? "text-white" : "text-slate-900")}>{title}</h1>
          {badge}
        </div>
        {description && <p className={clsx("mt-2 text-sm", dark ? "text-slate-400" : "text-slate-500")}>{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function QuickAction({ href, label, icon, color }: {
  href: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <a
      href={href}
      className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md transition group-hover:scale-110" style={{ background: color }}>
        {icon}
      </div>
      <span className="text-sm font-bold text-slate-700">{label}</span>
    </a>
  );
}
