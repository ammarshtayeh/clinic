"use client";

import { useMemo } from "react";
import { PageHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/status-badge";
import { TableSkeleton } from "@/components/ui/dialog";
import { AdminCard, AdminKpi, PlanPill } from "@/components/layout/admin-ui";
import { ProgressBar, TrendBadge } from "@/components/ui/charts";
import { useClinics } from "@/lib/admin/use-clinics";
import { computeMetrics, STATUS_STYLES, fmtMoney, fmtDate } from "@/lib/admin/metrics";
import { PLANS, SUBSCRIPTION_STATUS_LABELS } from "@/lib/types/database";
import type { PlanTier } from "@/lib/types/database";
import { Wallet, TrendingUp, AlertCircle, Users } from "lucide-react";

export default function SubscriptionsPage() {
  const { clinics, loading } = useClinics();
  const m = useMemo(() => computeMetrics(clinics), [clinics]);

  const planRows = useMemo(
    () =>
      (Object.keys(PLANS) as PlanTier[]).map((tier) => {
        const list = clinics.filter((c) => c.plan === tier);
        const paying = list.filter((c) => c.subscription_status === "active" || c.subscription_status === "past_due");
        return {
          tier,
          count: list.length,
          mrr: paying.reduce((s, c) => s + c.monthly_fee, 0),
        };
      }),
    [clinics]
  );

  const pastDue = useMemo(() => clinics.filter((c) => c.subscription_status === "past_due"), [clinics]);
  const billing = useMemo(
    () => [...clinics].sort((a, b) => b.monthly_fee - a.monthly_fee),
    [clinics]
  );

  return (
    <div>
      <PageHeader
        title="الاشتراكات والفوترة"
        description="إيرادات المنصة، الباقات، والمدفوعات المتأخرة"
        badge={<Badge variant="gold">{fmtMoney(m.mrr)}/شهر</Badge>}
        dark
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminKpi label="الإيراد الشهري" value={fmtMoney(m.mrr)} icon={Wallet} color="#10b981" trend={<TrendBadge value={8} />} />
        <AdminKpi label="الإيراد السنوي" value={fmtMoney(m.arr)} icon={TrendingUp} color="#06b6d4" hint="MRR × 12" />
        <AdminKpi label="متأخرة السداد" value={pastDue.length} icon={AlertCircle} color="#f59e0b" hint={fmtMoney(pastDue.reduce((s, c) => s + c.monthly_fee, 0))} />
        <AdminKpi label="المقاعد المباعة" value={m.seatsSold} icon={Users} color="#8b5cf6" hint={`${m.seatsUsed} مستخدم نشط`} />
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {planRows.map((p) => (
          <div key={p.tier} className="rounded-3xl border border-white/[0.06] bg-white/[0.03] p-5">
            <div className="mb-3 flex items-center justify-between">
              <PlanPill label={PLANS[p.tier].label} color={PLANS[p.tier].color} />
              <span className="text-xs text-slate-500">{p.count} عيادة</span>
            </div>
            <p className="text-2xl font-black text-white">{fmtMoney(p.mrr)}</p>
            <p className="mb-3 text-xs text-slate-500">{PLANS[p.tier].price}₪ / عيادة</p>
            <ProgressBar value={p.mrr} max={m.mrr || 1} color={PLANS[p.tier].color} dark />
            <ul className="mt-4 space-y-1">
              {PLANS[p.tier].features.slice(0, 3).map((f) => (
                <li key={f} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span className="h-1 w-1 rounded-full" style={{ background: PLANS[p.tier].color }} /> {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {pastDue.length > 0 && (
        <AdminCard title="مدفوعات متأخرة تحتاج متابعة" icon={AlertCircle} className="mb-6 !border-amber-500/20 !bg-amber-500/[0.04]">
          <div className="space-y-2">
            {pastDue.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-2xl border border-amber-500/10 bg-white/[0.02] px-4 py-3">
                <div>
                  <p className="font-bold text-white">{c.name}</p>
                  <p className="text-xs text-slate-500">{c.owner_name} · {c.city}</p>
                </div>
                <div className="text-left">
                  <p className="font-bold text-amber-400">{fmtMoney(c.monthly_fee)}</p>
                  <p className="text-xs text-slate-500">استحقت {fmtDate(c.next_billing_date)}</p>
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      )}

      <AdminCard title="سجل الفوترة لكل العيادات" icon={Wallet}>
        {loading ? <TableSkeleton /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-right text-xs text-slate-500">
                  <th className="px-3 py-2 font-semibold">العيادة</th>
                  <th className="px-3 py-2 font-semibold">الباقة</th>
                  <th className="px-3 py-2 font-semibold">الرسوم الشهرية</th>
                  <th className="px-3 py-2 font-semibold">الحالة</th>
                  <th className="px-3 py-2 font-semibold">الفوترة القادمة</th>
                </tr>
              </thead>
              <tbody>
                {billing.map((c) => (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-3 py-3">
                      <p className="font-bold text-white">{c.name}</p>
                      <p className="text-xs text-slate-500">{c.city}</p>
                    </td>
                    <td className="px-3 py-3"><PlanPill label={PLANS[c.plan].label} color={PLANS[c.plan].color} /></td>
                    <td className="px-3 py-3 font-bold text-emerald-400">{fmtMoney(c.monthly_fee)}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS_STYLES[c.subscription_status]}`}>
                        {SUBSCRIPTION_STATUS_LABELS[c.subscription_status]}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-400">{fmtDate(c.next_billing_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  );
}
