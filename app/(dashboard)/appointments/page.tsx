"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useClinic } from "@/lib/hooks/use-clinic";
import { PageHeader, Card, EmptyState } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/ui/dialog";
import { toast } from "@/lib/toast-store";
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
    supabase.from("appointments").select("*, patient:patients(full_name, file_number)")
      .eq("clinic_id", clinic.id).gte("appointment_date", today)
      .order("appointment_date").order("start_time")
      .then(({ data }) => { setAppointments((data ?? []) as Appointment[]); setLoading(false); });
  }, [clinic, supabase, today]);

  const updateStatus = async (id: string, status: string, label: string) => {
    await supabase.from("appointments").update({ status }).eq("id", id);
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: status as Appointment["status"] } : a)));
    toast.success(`تم: ${label}`);
  };

  const nextAction: Record<string, { status: string; label: string } | null> = {
    scheduled: { status: "confirmed", label: "تأكيد" },
    confirmed: { status: "checked_in", label: "وصل" },
    checked_in: { status: "completed", label: "إكمال" },
  };

  return (
    <div>
      <PageHeader title="المواعيد" description="إدارة وجدولة المواعيد"
        action={
          <div className="flex gap-2">
            <Link href="/appointments/calendar"><Button variant="ghost" size="sm">التقويم</Button></Link>
            <Link href="/appointments/new"><Button size="sm"><Plus size={16} className="ml-1 inline" />موعد</Button></Link>
          </div>
        } />

      <Card>
        {loading ? <TableSkeleton /> : appointments.length === 0 ? (
          <EmptyState title="لا مواعيد قادمة" action={<Link href="/appointments/new"><Button>حجز موعد</Button></Link>} />
        ) : (
          <div className="space-y-2">
            {appointments.map((a) => {
              const action = nextAction[a.status];
              return (
                <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 p-4 transition hover:border-cyan-200 hover:shadow-sm">
                  <div>
                    <p className="font-bold text-slate-800">{a.patient?.full_name} <span className="text-xs font-normal text-slate-400">#{a.patient?.file_number}</span></p>
                    <p className="text-sm text-slate-500">{a.appointment_date} · <span dir="ltr">{a.start_time?.slice(0, 5)}</span></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={a.status} type="appointment" />
                    {action && (
                      <Button size="sm" onClick={() => updateStatus(a.id, action.status, action.label)}>{action.label}</Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
