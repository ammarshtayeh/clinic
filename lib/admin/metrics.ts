import type { Clinic, PlanTier, SubscriptionStatus } from "@/lib/types/database";
import { PLANS } from "@/lib/types/database";

export interface PlatformMetrics {
  total: number;
  active: number;
  suspended: number;
  trialing: number;
  pastDue: number;
  mrr: number;
  arr: number;
  totalPatients: number;
  totalStaff: number;
  appointments30d: number;
  avgRevenuePerClinic: number;
  seatsSold: number;
  seatsUsed: number;
}

export function computeMetrics(clinics: Clinic[]): PlatformMetrics {
  const active = clinics.filter((c) => c.subscription_status === "active");
  const billing = clinics.filter((c) => c.subscription_status === "active" || c.subscription_status === "past_due");
  const mrr = billing.reduce((s, c) => s + (c.monthly_fee || 0), 0);
  return {
    total: clinics.length,
    active: active.length,
    suspended: clinics.filter((c) => c.subscription_status === "suspended").length,
    trialing: clinics.filter((c) => c.subscription_status === "trialing").length,
    pastDue: clinics.filter((c) => c.subscription_status === "past_due").length,
    mrr,
    arr: mrr * 12,
    totalPatients: clinics.reduce((s, c) => s + (c.patients_count || 0), 0),
    totalStaff: clinics.reduce((s, c) => s + (c.staff_count || 0), 0),
    appointments30d: clinics.reduce((s, c) => s + (c.appointments_30d || 0), 0),
    avgRevenuePerClinic: billing.length ? Math.round(mrr / billing.length) : 0,
    seatsSold: clinics.reduce((s, c) => s + (c.seats_total || 0), 0),
    seatsUsed: clinics.reduce((s, c) => s + (c.seats_used || 0), 0),
  };
}

export function planDistribution(clinics: Clinic[]): { label: string; value: number; color: string; tier: PlanTier }[] {
  return (Object.keys(PLANS) as PlanTier[]).map((tier) => ({
    tier,
    label: PLANS[tier].label,
    value: clinics.filter((c) => c.plan === tier).length,
    color: PLANS[tier].color,
  }));
}

export function revenueByPlan(clinics: Clinic[]): { label: string; value: number; color: string }[] {
  return (Object.keys(PLANS) as PlanTier[])
    .map((tier) => ({
      label: PLANS[tier].label,
      color: PLANS[tier].color,
      value: clinics
        .filter((c) => c.plan === tier && (c.subscription_status === "active" || c.subscription_status === "past_due"))
        .reduce((s, c) => s + c.monthly_fee, 0),
    }))
    .filter((s) => s.value > 0);
}

export const STATUS_STYLES: Record<SubscriptionStatus, string> = {
  active: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
  trialing: "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20",
  past_due: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
  suspended: "bg-rose-500/15 text-rose-400 border border-rose-500/20",
  cancelled: "bg-slate-500/15 text-slate-400 border border-slate-500/20",
};

export function daysUntil(dateIso: string | null): number | null {
  if (!dateIso) return null;
  const diff = new Date(dateIso).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function fmtMoney(n: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(n)) + " ₪";
}

export function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ar", { year: "numeric", month: "short", day: "numeric" });
}
