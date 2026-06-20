"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from "date-fns";
import { ar } from "date-fns/locale";
import clsx from "clsx";
import { createClient } from "@/lib/supabase/client";
import { useClinic } from "@/lib/hooks/use-clinic";
import { PageHeader, Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import type { Appointment } from "@/lib/types/database";

const WEEKDAYS = ["أحد", "إثن", "ثلا", "أرب", "خمي", "جمع", "سبت"];

export default function CalendarPage() {
  const { clinic } = useClinic();
  const [current, setCurrent] = useState(new Date());
  const [selected, setSelected] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const supabase = createClient();

  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart);

  useEffect(() => {
    if (!clinic) return;
    supabase.from("appointments")
      .select("*, patient:patients(full_name, file_number)")
      .eq("clinic_id", clinic.id)
      .gte("appointment_date", format(monthStart, "yyyy-MM-dd"))
      .lte("appointment_date", format(monthEnd, "yyyy-MM-dd"))
      .then(({ data }) => setAppointments((data ?? []) as Appointment[]));
  }, [clinic, supabase, current]);

  const dayAppointments = useMemo(() =>
    appointments.filter((a) => a.appointment_date === format(selected, "yyyy-MM-dd")),
  [appointments, selected]);

  const countByDay = useMemo(() => {
    const map: Record<string, number> = {};
    appointments.forEach((a) => { map[a.appointment_date] = (map[a.appointment_date] ?? 0) + 1; });
    return map;
  }, [appointments]);

  return (
    <div>
      <PageHeader
        title="تقويم المواعيد"
        description={format(current, "MMMM yyyy", { locale: ar })}
        action={<Link href="/appointments/new"><Button size="sm">+ موعد</Button></Link>}
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <button onClick={() => setCurrent(subMonths(current, 1))} className="rounded-xl p-2 hover:bg-slate-100"><ChevronRight size={20} /></button>
            <h3 className="font-black text-slate-800">{format(current, "MMMM yyyy", { locale: ar })}</h3>
            <button onClick={() => setCurrent(addMonths(current, 1))} className="rounded-xl p-2 hover:bg-slate-100"><ChevronLeft size={20} /></button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((d) => <div key={d} className="py-2 text-xs font-bold text-slate-400">{d}</div>)}
            {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const count = countByDay[key] ?? 0;
              const isSelected = isSameDay(day, selected);
              const isToday = isSameDay(day, new Date());
              return (
                <button
                  key={key}
                  onClick={() => setSelected(day)}
                  className={clsx(
                    "relative rounded-xl py-2 text-sm font-medium transition",
                    !isSameMonth(day, current) && "text-slate-300",
                    isSelected && "bg-cyan-600 text-white shadow-lg shadow-cyan-500/30",
                    !isSelected && isToday && "bg-cyan-50 text-cyan-700 ring-2 ring-cyan-300",
                    !isSelected && !isToday && "hover:bg-slate-50"
                  )}
                >
                  {format(day, "d")}
                  {count > 0 && !isSelected && (
                    <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-cyan-500" />
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        <Card title={format(selected, "EEEE d MMMM", { locale: ar })} className="lg:col-span-2">
          {dayAppointments.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">لا مواعيد</p>
          ) : (
            <div className="space-y-2">
              {dayAppointments.sort((a, b) => a.start_time.localeCompare(b.start_time)).map((apt) => (
                <div key={apt.id} className="rounded-2xl border border-slate-100 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-800">{apt.patient?.full_name}</p>
                      <p className="text-xs text-slate-400" dir="ltr">{apt.start_time?.slice(0, 5)}</p>
                    </div>
                    <StatusBadge status={apt.status} type="appointment" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
