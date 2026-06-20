"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Calendar, Stethoscope, FileText, UserPlus, CalendarPlus, Receipt } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useClinic } from "@/lib/hooks/use-clinic";
import { StatCard, Card, PageHeader, QuickAction } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatSkeleton, TableSkeleton } from "@/components/ui/dialog";
import { format } from "date-fns";
import { canAccess } from "@/lib/permissions";

export default function DashboardPage() {
  const { clinic, membership, profile } = useClinic();
  const [stats, setStats] = useState({ patients: 0, todayAppointments: 0, treatments: 0, pendingInvoices: 0, revenue: 0 });
  const [recentAppointments, setRecentAppointments] = useState<Array<{
    id: string; appointment_date: string; start_time: string; status: string;
    patient: { full_name: string } | null;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const role = membership?.role;

  useEffect(() => {
    if (!clinic) return;
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
    ]).then(([patients, appointments, treatments, invoices, revenueData, recent]) => {
      const revenue = (revenueData.data ?? []).reduce((s, i) => s + Number(i.paid_amount), 0);
      setStats({
        patients: patients.count ?? 0,
        todayAppointments: appointments.count ?? 0,
        treatments: treatments.count ?? 0,
        pendingInvoices: invoices.count ?? 0,
        revenue,
      });
      setRecentAppointments((recent.data ?? []) as unknown as typeof recentAppointments);
      setLoading(false);
    });
  }, [clinic, supabase]);

  return (
    <div>
      <PageHeader
        title="لوحة التحكم"
        description={`${clinic?.name ?? "عيادتك"} — نظرة عامة على نشاط اليوم`}
      />

      <div className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-3">
        {canAccess(role, "patients") && (
          <QuickAction href="/patients/new" label="مريض جديد" icon={<UserPlus size={20} />} color="linear-gradient(135deg,#06b6d4,#0891b2)" />
        )}
        {canAccess(role, "appointments") && (
          <QuickAction href="/appointments/new" label="موعد جديد" icon={<CalendarPlus size={20} />} color="linear-gradient(135deg,#8b5cf6,#6d28d9)" />
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
          <StatCard label="إيرادات الشهر" value={`${stats.revenue} ₪`} icon={<FileText size={22} />} glow="#10b981" />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <Card title="مواعيد اليوم" className="lg:col-span-3" action={
          <Link href="/appointments/calendar" className="text-sm font-bold text-cyan-600 hover:underline">التقويم ←</Link>
        }>
          {loading ? <TableSkeleton rows={4} /> : recentAppointments.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">لا توجد مواعيد قادمة — <Link href="/appointments/new" className="text-cyan-600">احجز موعد</Link></p>
          ) : (
            <div className="space-y-2">
              {recentAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3">
                  <div>
                    <p className="font-bold text-slate-800">{apt.patient?.full_name ?? "—"}</p>
                    <p className="text-xs text-slate-400">{apt.appointment_date} · <span dir="ltr">{apt.start_time?.slice(0, 5)}</span></p>
                  </div>
                  <StatusBadge status={apt.status} type="appointment" />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="ملخص سريع" className="lg:col-span-2" dark>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-white/10 pb-3">
              <span className="text-slate-400">فواتير معلقة</span>
              <span className="font-black text-amber-400">{stats.pendingInvoices}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-3">
              <span className="text-slate-400">إيرادات الشهر</span>
              <span className="font-black text-emerald-400">{stats.revenue} ₪</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">المستخدم</span>
              <span className="font-bold">{profile?.full_name}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
