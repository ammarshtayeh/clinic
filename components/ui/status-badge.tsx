import clsx from "clsx";
import type { AppointmentStatus, InvoiceStatus, TreatmentStatus } from "@/lib/types/database";
import { APPOINTMENT_STATUS_LABELS, INVOICE_STATUS_LABELS } from "@/lib/types/database";

const appointmentColors: Record<AppointmentStatus, string> = {
  scheduled: "bg-slate-100 text-slate-700",
  confirmed: "bg-sky-100 text-sky-700",
  checked_in: "bg-violet-100 text-violet-700",
  in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-600",
  no_show: "bg-orange-100 text-orange-700",
};

const invoiceColors: Record<InvoiceStatus, string> = {
  draft: "bg-slate-100 text-slate-600",
  issued: "bg-sky-100 text-sky-700",
  paid: "bg-emerald-100 text-emerald-700",
  partial: "bg-amber-100 text-amber-700",
  void: "bg-rose-100 text-rose-600",
};

const treatmentColors: Record<TreatmentStatus, string> = {
  planned: "bg-sky-100 text-sky-700",
  in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-600",
};

export function StatusBadge({ status, type }: {
  status: string;
  type: "appointment" | "invoice" | "treatment" | "default";
}) {
  let label = status;
  let color = "bg-slate-100 text-slate-700";

  if (type === "appointment") {
    label = APPOINTMENT_STATUS_LABELS[status as AppointmentStatus] ?? status;
    color = appointmentColors[status as AppointmentStatus] ?? color;
  } else if (type === "invoice") {
    label = INVOICE_STATUS_LABELS[status as InvoiceStatus] ?? status;
    color = invoiceColors[status as InvoiceStatus] ?? color;
  } else if (type === "treatment") {
    const labels: Record<string, string> = { planned: "مخطط", in_progress: "جاري", completed: "مكتمل", cancelled: "ملغي" };
    label = labels[status] ?? status;
    color = treatmentColors[status as TreatmentStatus] ?? color;
  }

  return (
    <span className={clsx("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", color)}>
      {label}
    </span>
  );
}

export function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "gold" | "cyan" }) {
  const variants = {
    default: "bg-slate-100 text-slate-700",
    gold: "bg-amber-100 text-amber-800",
    cyan: "bg-cyan-100 text-cyan-800",
  };
  return (
    <span className={clsx("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", variants[variant])}>
      {children}
    </span>
  );
}
