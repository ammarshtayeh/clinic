"use client";

import { useEffect, useState } from "react";
import { Users, Calendar, Stethoscope, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useClinic } from "@/lib/hooks/use-clinic";
import { StatCard, Card, PageHeader } from "@/components/ui/card";
import { APPOINTMENT_STATUS_LABELS } from "@/lib/types/database";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { clinic } = useClinic();
  const [stats, setStats] = useState({ patients: 0, todayAppointments: 0, treatments: 0, pendingInvoices: 0 });
  const [recentAppointments, setRecentAppointments] = useState<Array<{
    id: string;
    appointment_date: string;
    start_time: string;
    status: string;
    patient: { full_name: string } | null;
  }>>([]);
  const supabase = createClient();

  useEffect(() => {
    if (!clinic) return;

    const today = format(new Date(), "yyyy-MM-dd");

    Promise.all([
      supabase.from("patients").select("id", { count: "exact", head: true }).eq("clinic_id", clinic.id).eq("is_active", true),
      supabase.from("appointments").select("id", { count: "exact", head: true }).eq("clinic_id", clinic.id).eq("appointment_date", today),
      supabase.from("treatments").select("id", { count: "exact", head: true }).eq("clinic_id", clinic.id).eq("status", "planned"),
      supabase.from("invoices").select("id", { count: "exact", head: true }).eq("clinic_id", clinic.id).in("status", ["issued", "partial"]),
      supabase.from("appointments")
        .select("id, appointment_date, start_time, status, patient:patients(full_name)")
        .eq("clinic_id", clinic.id)
        .gte("appointment_date", today)
        .order("appointment_date")
        .order("start_time")
        .limit(5),
    ]).then(([patients, appointments, treatments, invoices, recent]) => {
      setStats({
        patients: patients.count ?? 0,
        todayAppointments: appointments.count ?? 0,
        treatments: treatments.count ?? 0,
        pendingInvoices: invoices.count ?? 0,
      });
      setRecentAppointments((recent.data ?? []) as typeof recentAppointments);
    });
  }, [clinic, supabase]);

  return (
    <div>
      <PageHeader
        title={`مرحباً بك في ${clinic?.name ?? "عيادتك"}`}
        description="نظرة عامة على نشاط العيادة اليوم"
        action={
          <Link href="/patients/new">
            <Button>مريض جديد</Button>
          </Link>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="إجمالي المرضى" value={stats.patients} icon={<Users size={24} />} color="linear-gradient(135deg, #0a91b6, #0b6685)" />
        <StatCard label="مواعيد اليوم" value={stats.todayAppointments} icon={<Calendar size={24} />} color="linear-gradient(135deg, #8b5cf6, #6d28d9)" />
        <StatCard label="علاجات مخططة" value={stats.treatments} icon={<Stethoscope size={24} />} color="linear-gradient(135deg, #f59e0b, #d97706)" />
        <StatCard label="فواتير معلقة" value={stats.pendingInvoices} icon={<FileText size={24} />} color="linear-gradient(135deg, #ef4444, #dc2626)" />
      </div>

      <Card title="المواعيد القادمة">
        {recentAppointments.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">لا توجد مواعيد قادمة</p>
        ) : (
          <div className="table-shell">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-4 py-3 text-right font-medium text-slate-600">المريض</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">التاريخ</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">الوقت</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {recentAppointments.map((apt) => (
                  <tr key={apt.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium">{apt.patient?.full_name ?? "—"}</td>
                    <td className="px-4 py-3">{apt.appointment_date}</td>
                    <td className="px-4 py-3" dir="ltr">{apt.start_time?.slice(0, 5)}</td>
                    <td className="px-4 py-3">
                      {APPOINTMENT_STATUS_LABELS[apt.status as keyof typeof APPOINTMENT_STATUS_LABELS] ?? apt.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
