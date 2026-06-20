"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useClinic } from "@/lib/hooks/use-clinic";
import { PageHeader, Card, StatCard } from "@/components/ui/card";
import { StatSkeleton } from "@/components/ui/dialog";
import { Users, Calendar, TrendingUp, FileText } from "lucide-react";
import { format, subMonths } from "date-fns";
import { ar } from "date-fns/locale";

export default function ReportsPage() {
  const { clinic } = useClinic();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalPatients: 0, monthAppointments: 0, monthRevenue: 0, monthInvoices: 0,
    topProcedures: [] as { name: string; count: number }[],
  });
  const supabase = createClient();
  const monthStart = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd");

  useEffect(() => {
    if (!clinic) return;
    Promise.all([
      supabase.from("patients").select("id", { count: "exact", head: true }).eq("clinic_id", clinic.id).eq("is_active", true),
      supabase.from("appointments").select("id", { count: "exact", head: true }).eq("clinic_id", clinic.id).gte("appointment_date", monthStart),
      supabase.from("invoices").select("paid_amount, total").eq("clinic_id", clinic.id).gte("created_at", monthStart),
      supabase.from("treatments").select("procedure:procedures(name_ar)").eq("clinic_id", clinic.id).gte("treatment_date", monthStart),
    ]).then(([patients, appointments, invoices, treatments]) => {
      const invData = invoices.data ?? [];
      const procMap: Record<string, number> = {};
      (treatments.data ?? []).forEach((t) => {
        const name = ((t.procedure as unknown) as { name_ar: string } | null)?.name_ar ?? "أخرى";
        procMap[name] = (procMap[name] ?? 0) + 1;
      });
      setData({
        totalPatients: patients.count ?? 0,
        monthAppointments: appointments.count ?? 0,
        monthRevenue: invData.reduce((s, i) => s + Number(i.paid_amount), 0),
        monthInvoices: invData.length,
        topProcedures: Object.entries(procMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count })),
      });
      setLoading(false);
    });
  }, [clinic, supabase, monthStart]);

  const monthLabel = format(new Date(), "MMMM yyyy", { locale: ar });

  return (
    <div>
      <PageHeader title="التقارير" description={`إحصائيات ${monthLabel}`} />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)}
        </div>
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="إجمالي المرضى" value={data.totalPatients} icon={<Users size={22} />} glow="#06b6d4" />
            <StatCard label="مواعيد الشهر" value={data.monthAppointments} icon={<Calendar size={22} />} glow="#8b5cf6" />
            <StatCard label="إيرادات الشهر" value={`${data.monthRevenue} ₪`} icon={<TrendingUp size={22} />} glow="#10b981" />
            <StatCard label="فواتير الشهر" value={data.monthInvoices} icon={<FileText size={22} />} glow="#f59e0b" />
          </div>

          <Card title="أكثر الإجراءات هذا الشهر">
            {data.topProcedures.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">لا توجد بيانات</p>
            ) : (
              <div className="space-y-3">
                {data.topProcedures.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-50 text-sm font-black text-cyan-700">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm font-bold">
                        <span>{p.name}</span>
                        <span className="text-cyan-600">{p.count}</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-gradient-to-l from-cyan-400 to-cyan-600" style={{ width: `${(p.count / data.topProcedures[0].count) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
