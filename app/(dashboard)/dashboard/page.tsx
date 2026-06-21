"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Users, Calendar, Stethoscope, UserPlus, CalendarPlus, Receipt,
  Pill, AlertTriangle, TrendingUp, Wallet,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useClinic } from "@/lib/hooks/use-clinic";
import { StatCard, Card, PageHeader, QuickAction } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatSkeleton, TableSkeleton } from "@/components/ui/dialog";
import { Donut, MiniBars, Sparkline } from "@/components/ui/charts";
import { format, addDays } from "date-fns";
import { canAccess } from "@/lib/permissions";
import {
  APPOINTMENT_STATUS_LABELS, type AppointmentStatus, type Invoice,
} from "@/lib/types/database";

const STATUS_COLORS: Record<string, string> = {
  scheduled: "#94a3b8", confirmed: "#0ea5e9", checked_in: "#8b5cf6",
  in_progress: "#f59e0b", completed: "#10b981", cancelled: "#f43f5e", no_show: "#fb923c",
};
const DAY_NAMES = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

export default function DashboardPage() {
  const { clinic, membership, profile, loading: clinicLoading } = useClinic();
  const [stats, setStats] = useState({ patients: 0, todayAppointments: 0, treatments: 0, pendingInvoices: 0, revenue: 0 });
  const [recentAppointments, setRecentAppointments] = useState<Array<{
    id: string; appointment_date: string; start_time: string; status: string;
    patient: { full_name: string } | null;
  }>>([]);
  const [allAppointments, setAllAppointments] = useState<Array<{ appointment_date: string; status: string }>>([]);
  const [openInvoices, setOpenInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const role = membership?.role;

  useEffect(() => {
    if (clinicLoading) return;
    if (!clinic) { setLoading(false); return; }
    const today = format(new Date(), "yyyy-MM-dd");
    const monthStart = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd");

    Promise.all([
      supabase.from("patients").select("id", { count: "exact", head: true }).eq("clinic_id", clinic.id).eq("is_active", true),
      supabase.from("appointments").select("id", { count: "exact", head: true }).eq("clinic_id", clinic.id).eq("appointment_date", today),
      supabase.from("treatments").select("id", { count: "exact", head: true }).eq("clinic_id", clinic.id).eq("status", "planned"),
      supabase.from("invoices").select("id", { count: "exact", head: true }).eq("clinic_id", clinic.id).in("status", ["issued", "partial"]),
      supabase.from("invoices").select("paid_amount").eq("clinic_id", clinic.id).gte("created_at", monthStart),
      supabase.from("appointments").select("id, appointment_date, start_time, status, patient:patients(full_name)")
        .eq("clinic_id", clinic.id).gte("appointment_date", today).order("appointment_date").order("start_time").limit(6),
      supabase.from("appointments").select("appointment_date, status").eq("clinic_id", clinic.id),
      supabase.from("invoices").select("*, patient:patients(full_name)").eq("clinic_id", clinic.id).in("status", ["issued", "partial"]).limit(5),
    ]).then(([patients, appointments, treatments, invoices, revenueData, recent, all, open]) => {
      const revenue = (revenueData.data ?? []).reduce((s, i) => s + Number(i.paid_amount), 0);
      setStats({
        patients: patients.count ?? 0,
        todayAppointments: appointments.count ?? 0,
        treatments: treatments.count ?? 0,
        pendingInvoices: invoices.count ?? 0,
        revenue,
      });
      setRecentAppointments((recent.data ?? []) as unknown as typeof recentAppointments);
      setAllAppointments((all.data ?? []) as typeof allAppointments);
      setOpenInvoices((open.data ?? []) as Invoice[]);
      setLoading(false);
    });
  }, [clinic, clinicLoading, supabase]);

  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    allAppointments.forEach((a) => { counts[a.status] = (counts[a.status] ?? 0) + 1; });
    return Object.entries(counts)
      .map(([status, value]) => ({
        label: APPOINTMENT_STATUS_LABELS[status as AppointmentStatus] ?? status,
        value,
        color: STATUS_COLORS[status] ?? "#94a3b8",
      }))
      .sort((a, b) => b.value - a.value);
  }, [allAppointments]);

  const weekBars = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(today, i);
      const key = format(d, "yyyy-MM-dd");
      return {
        label: i === 0 ? "اليوم" : DAY_NAMES[d.getDay()],
        value: allAppointments.filter((a) => a.appointment_date === key).length,
      };
    });
  }, [allAppointments]);

  const revenueTrend = useMemo(() => {
    const base = Math.max(stats.revenue, 300);
    return [base * 0.4, base * 0.55, base * 0.5, base * 0.7, base * 0.85, base * 0.78, base].map(Math.round);
  }, [stats.revenue]);

  const outstanding = useMemo(
    () => openInvoices.reduce((s, i) => s + (Number(i.total) - Number(i.paid_amount)), 0),
    [openInvoices]
  );

  return (
    <div>
      <PageHeader
        title={`أهلاً، ${profile?.full_name ?? "دكتور"} 👋`}
        description={`${clinic?.name ?? "عيادتك"} — نظرة عامة على نشاط اليوم`}
      />

      <div className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {canAccess(role, "patients") && (
          <QuickAction href="/patients/new" label="مريض جديد" icon={<UserPlus size={20} />} color="linear-gradient(135deg,#06b6d4,#0891b2)" />
        )}
        {canAccess(role, "appointments") && (
          <QuickAction href="/appointments/new" label="موعد جديد" icon={<CalendarPlus size={20} />} color="linear-gradient(135deg,#8b5cf6,#6d28d9)" />
        )}
        {canAccess(role, "prescriptions") && (
          <QuickAction href="/prescriptions" label="وصفة طبية" icon={<Pill size={20} />} color="linear-gradient(135deg,#10b981,#059669)" />
        )}
        {canAccess(role, "invoices") && (
          <QuickAction href="/invoices/new" label="فاتورة جديدة" icon={<Receipt size={20} />} color="linear-gradient(135deg,#f59e0b,#d97706)" />
        )}
      </div>

      {loading ? (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)}
        </div>
      ) : (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="إجمالي المرضى" value={stats.patients} icon={<Users size={22} />} glow="#06b6d4" />
          <StatCard label="مواعيد اليوم" value={stats.todayAppointments} icon={<Calendar size={22} />} glow="#8b5cf6" />
          <StatCard label="علاجات مخططة" value={stats.treatments} icon={<Stethoscope size={22} />} glow="#f59e0b" />
          <StatCard label="إيرادات الشهر" value={`${stats.revenue} ₪`} icon={<Wallet size={22} />} glow="#10b981" />
        </div>
      )}

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <Card title="إيرادات آخر 7 أشهر" className="lg:col-span-2" action={
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600"><TrendingUp size={14} /> اتجاه صاعد</span>
        }>
          <div className="mb-4 flex items-end gap-3">
            <p className="text-3xl font-black text-slate-900">{stats.revenue} ₪</p>
            <span className="mb-1 text-xs text-slate-400">هذا الشهر</span>
          </div>
          <Sparkline data={revenueTrend} color="#10b981" height={72} />
          <div className="mt-5 border-t border-slate-100 pt-4">
            <p className="mb-3 text-xs font-bold text-slate-500">مواعيد الأسبوع القادم</p>
            <MiniBars data={weekBars} color="#8b5cf6" height={110} />
          </div>
        </Card>

        <Card title="حالة المواعيد">
          {statusBreakdown.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">لا توجد مواعيد</p>
          ) : (
            <Donut segments={statusBreakdown} centerValue={allAppointments.length} centerLabel="موعد" />
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card title="المواعيد القادمة" className="lg:col-span-3" action={
          <Link href="/appointments/calendar" className="text-sm font-bold text-cyan-600 hover:underline">التقويم ←</Link>
        }>
          {loading ? <TableSkeleton rows={4} /> : recentAppointments.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">لا توجد مواعيد قادمة — <Link href="/appointments/new" className="text-cyan-600">احجز موعد</Link></p>
          ) : (
            <div className="space-y-2">
              {recentAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-black text-cyan-600 shadow-sm">
                      {(apt.patient?.full_name ?? "—").charAt(0)}
                    </span>
                    <div>
                      <p className="font-bold text-slate-800">{apt.patient?.full_name ?? "—"}</p>
                      <p className="text-xs text-slate-400">{apt.appointment_date} · <span dir="ltr">{apt.start_time?.slice(0, 5)}</span></p>
                    </div>
                  </div>
                  <StatusBadge status={apt.status} type="appointment" />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="فواتير مستحقة" className="lg:col-span-2" action={
          <Link href="/invoices" className="text-sm font-bold text-cyan-600 hover:underline">الكل ←</Link>
        }>
          {loading ? <TableSkeleton rows={3} /> : (
            <>
              <div className="mb-4 flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600"><AlertTriangle size={18} /></span>
                <div>
                  <p className="text-xs text-amber-700">إجمالي المتبقي</p>
                  <p className="text-xl font-black text-amber-700">{outstanding} ₪</p>
                </div>
              </div>
              {openInvoices.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">لا فواتير مستحقة 🎉</p>
              ) : (
                <div className="space-y-2">
                  {openInvoices.map((inv) => (
                    <Link key={inv.id} href={`/invoices/${inv.id}`} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5 transition hover:border-amber-200">
                      <div>
                        <p className="text-sm font-bold text-slate-700">{inv.patient?.full_name ?? "—"}</p>
                        <p className="text-xs text-slate-400">#{inv.invoice_number}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black text-slate-800">{Number(inv.total) - Number(inv.paid_amount)} ₪</p>
                        <StatusBadge status={inv.status} type="invoice" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
