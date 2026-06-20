"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useClinic } from "@/lib/hooks/use-clinic";
import { PageHeader, Card, EmptyState, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { APPOINTMENT_STATUS_LABELS } from "@/lib/types/database";
import type { Appointment } from "@/lib/types/database";
import { Plus } from "lucide-react";
import { format } from "date-fns";

export default function AppointmentsPage() {
  const { clinic } = useClinic();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    if (!clinic) return;
    supabase
      .from("appointments")
      .select("*, patient:patients(full_name, file_number)")
      .eq("clinic_id", clinic.id)
      .gte("appointment_date", today)
      .order("appointment_date")
      .order("start_time")
      .then(({ data }) => {
        setAppointments((data ?? []) as Appointment[]);
        setLoading(false);
      });
  }, [clinic, supabase, today]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("appointments").update({ status }).eq("id", id);
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: status as Appointment["status"] } : a)));
  };

  return (
    <div>
      <PageHeader
        title="المواعيد"
        description="إدارة مواعيد العيادة"
        action={
          <Link href="/appointments/new">
            <Button><Plus size={16} className="ml-2 inline" />موعد جديد</Button>
          </Link>
        }
      />

      <Card>
        {loading ? (
          <div className="py-12 text-center text-slate-400">جاري التحميل...</div>
        ) : appointments.length === 0 ? (
          <EmptyState
            title="لا توجد مواعيد"
            description="جدول المواعيد فارغ"
            action={<Link href="/appointments/new"><Button>حجز موعد</Button></Link>}
          />
        ) : (
          <div className="table-shell">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-4 py-3 text-right font-medium text-slate-600">المريض</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">التاريخ</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">الوقت</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">الحالة</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <span className="font-medium">{a.patient?.full_name}</span>
                      <span className="mr-2 text-xs text-slate-400">#{a.patient?.file_number}</span>
                    </td>
                    <td className="px-4 py-3">{a.appointment_date}</td>
                    <td className="px-4 py-3" dir="ltr">{a.start_time?.slice(0, 5)}</td>
                    <td className="px-4 py-3"><Badge color="#0a91b6">{APPOINTMENT_STATUS_LABELS[a.status]}</Badge></td>
                    <td className="px-4 py-3">
                      {a.status === "scheduled" && (
                        <button onClick={() => updateStatus(a.id, "confirmed")} className="text-xs text-cyan-600 hover:underline">تأكيد</button>
                      )}
                      {a.status === "confirmed" && (
                        <button onClick={() => updateStatus(a.id, "checked_in")} className="text-xs text-cyan-600 hover:underline">وصل</button>
                      )}
                      {a.status === "checked_in" && (
                        <button onClick={() => updateStatus(a.id, "completed")} className="text-xs text-green-600 hover:underline">إكمال</button>
                      )}
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
