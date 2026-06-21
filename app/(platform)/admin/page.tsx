"use client";

import { useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/status-badge";
import { TableSkeleton } from "@/components/ui/dialog";
import { Donut, MiniBars, Sparkline, TrendBadge } from "@/components/ui/charts";
import { AdminCard, AdminKpi, PlanPill } from "@/components/layout/admin-ui";
import { useClinics } from "@/lib/admin/use-clinics";
import {
  computeMetrics, planDistribution, revenueByPlan, STATUS_STYLES, daysUntil, fmtMoney, fmtDate,
} from "@/lib/admin/metrics";
import { PLANS, SUBSCRIPTION_STATUS_LABELS } from "@/lib/types/database";
import { BRAND } from "@/lib/brand";
import {
  Building2, Wallet, Users, CalendarCheck, AlertTriangle, Clock, ArrowLeft, TrendingUp,
} from "lucide-react";

const MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

export default function AdminDashboardPage() {
  const { clinics, loading } = useClinics();

  const m = useMemo(() => computeMetrics(clinics), [clinics]);
  const plans = useMemo(() => planDistribution(clinics), [clinics]);
  const revPlan = useMemo(() => revenueByPlan(clinics), [clinics]);

  const signups = useMemo(() => {
    const now = new Date();
    const buckets: { label: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const count = clinics.filter((c) => {
        const t = new Date(c.created_at);
        return t >= d && t < next;
      }).length;
      buckets.push({ label: MONTHS[d.getMonth()].slice(0, 3), value: count });
    }
    return buckets;
  }, [clinics]);

  const revenueTrend = useMemo(() => {
    let base = Math.max(400, m.mrr * 0.55);
    return Array.from({ length: 8 }, () => {
      base *= 1 + (0.06 + Math.random() * 0.05);
      return Math.round(base);
    }).concat(m.mrr);
  }, [m.mrr]);

  const attention = useMemo(() => {
    const list: { clinic: typeof clinics[number]; reason: string; tone: string }[] = [];
    clinics.forEach((c) => {
      if (c.subscription_status === "past_due") list.push({ clinic: c, reason: "دفعة متأخرة", tone: "text-amber-400" });
      else if (c.subscription_status === "suspended") list.push({ clinic: c, reason: "اشتراك موقوف", tone: "text-rose-400" });
      else if (c.subscription_status === "trialing") {
        const d = daysUntil(c.trial_ends_at);
        if (d !== null) list.push({ clinic: c, reason: `تنتهي التجربة خلال ${d} يوم`, tone: "text-cyan-400" });
      }
    });
    return list;
  }, [clinics]);

  const topClinics = useMemo(
    () => [...clinics].sort((a, b) => b.monthly_fee - a.monthly_fee).slice(0, 5),
    [clinics]
  );

  return (
    <div>
      <PageHeader
        title="لوحة المنصة"
        description={`${BRAND.name} — نظرة شاملة على أداء المنصة والاشتراكات`}
        badge={<Badge variant="gold">Super Admin</Badge>}
        dark
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminKpi
          label="إجمالي العيادات"
          value={m.total}
          icon={Building2}
          color="#f59e0b"
          hint={`${m.active} نشطة · ${m.trialing} تجريبي`}
          trend={<TrendBadge value={12} />}
        />
        <AdminKpi
          label="الإيراد الشهري (MRR)"
          value={fmtMoney(m.mrr)}
          icon={Wallet}
          color="#10b981"
          hint={`سنوياً ${fmtMoney(m.arr)}`}
          trend={<TrendBadge value={8} />}
        />
        <AdminKpi
          label="إجمالي المرضى"
          value={m.totalPatients.toLocaleString("en-US")}
          icon={Users}
          color="#06b6d4"
          hint={`${m.totalStaff} موظف عبر المنصة`}
        />
        <AdminKpi
          label="مواعيد (30 يوم)"
          value={m.appointments30d.toLocaleString("en-US")}
          icon={CalendarCheck}
          color="#8b5cf6"
          hint={`متوسط ${fmtMoney(m.avgRevenuePerClinic)} / عيادة`}
        />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <AdminCard title="نمو الإيراد الشهري" subtitle="آخر 9 أشهر" icon={TrendingUp} className="lg:col-span-2">
          <div className="mb-4 flex items-end gap-3">
            <p className="text-3xl font-black text-white">{fmtMoney(m.mrr)}</p>
            <TrendBadge value={8} />
          </div>
          <Sparkline data={revenueTrend} color="#10b981" height={70} />
          <div className="mt-5 border-t border-white/5 pt-4">
            <p className="mb-3 text-xs font-bold text-slate-500">عيادات جديدة شهرياً</p>
            <MiniBars data={signups} color="#f59e0b" height={110} dark />
          </div>
        </AdminCard>

        <AdminCard title="توزيع الباقات" subtitle="حسب عدد العيادات">
          <Donut
            segments={plans.filter((p) => p.value > 0)}
            centerValue={m.total}
            centerLabel="عيادة"
            dark
          />
          <div className="mt-5 border-t border-white/5 pt-4">
            <p className="mb-3 text-xs font-bold text-slate-500">الإيراد حسب الباقة</p>
            <div className="space-y-2">
              {revPlan.map((r) => (
                <div key={r.label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-300">
                    <span className="h-2 w-2 rounded-full" style={{ background: r.color }} />
                    {r.label}
                  </span>
                  <span className="font-bold text-white">{fmtMoney(r.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </AdminCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <AdminCard
          title="تحتاج إلى انتباه"
          subtitle={`${attention.length} عيادة`}
          icon={AlertTriangle}
          action={<Link href="/admin/clinics" className="text-xs font-bold text-amber-400 hover:underline">الكل ←</Link>}
        >
          {loading ? <TableSkeleton rows={3} /> : attention.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">كل العيادات على ما يرام</p>
          ) : (
            <div className="space-y-2">
              {attention.map(({ clinic, reason, tone }) => (
                <Link
                  key={clinic.id}
                  href="/admin/clinics"
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 transition hover:bg-white/[0.05]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">{clinic.name}</p>
                    <p className="text-xs text-slate-500">{clinic.city}</p>
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-semibold ${tone}`}>
                    <Clock size={12} />
                    {reason}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </AdminCard>

        <AdminCard
          title="أعلى العيادات إيراداً"
          icon={Building2}
          className="lg:col-span-2"
          action={<Link href="/admin/clinics" className="text-xs font-bold text-amber-400 hover:underline">إدارة العيادات ←</Link>}
        >
          {loading ? <TableSkeleton rows={5} /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-right text-xs text-slate-500">
                    <th className="px-3 py-2 font-semibold">العيادة</th>
                    <th className="px-3 py-2 font-semibold">الباقة</th>
                    <th className="px-3 py-2 font-semibold">المرضى</th>
                    <th className="px-3 py-2 font-semibold">الحالة</th>
                    <th className="px-3 py-2 font-semibold">الإيراد</th>
                  </tr>
                </thead>
                <tbody>
                  {topClinics.map((c) => (
                    <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="px-3 py-3">
                        <p className="font-bold text-white">{c.name}</p>
                        <p className="text-xs text-slate-500">{c.city}</p>
                      </td>
                      <td className="px-3 py-3"><PlanPill label={PLANS[c.plan].label} color={PLANS[c.plan].color} /></td>
                      <td className="px-3 py-3 text-slate-400">{c.patients_count}</td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS_STYLES[c.subscription_status]}`}>
                          {SUBSCRIPTION_STATUS_LABELS[c.subscription_status]}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-bold text-emerald-400">{fmtMoney(c.monthly_fee)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Link
            href="/admin/subscriptions"
            className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-white/5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
          >
            عرض تفاصيل الفوترة <ArrowLeft size={16} />
          </Link>
        </AdminCard>
      </div>

      <p className="mt-6 text-xs text-slate-600">
        آخر تحديث {fmtDate(new Date().toISOString())} · بيانات تجريبية حتى ربط قاعدة البيانات
      </p>
    </div>
  );
}
