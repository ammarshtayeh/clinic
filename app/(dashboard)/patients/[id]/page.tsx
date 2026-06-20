"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PageHeader, Card, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Patient, Appointment, Treatment } from "@/lib/types/database";
import { APPOINTMENT_STATUS_LABELS } from "@/lib/types/database";
import { Calendar, Stethoscope, Smile } from "lucide-react";

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from("patients").select("*").eq("id", id).single(),
      supabase.from("appointments").select("*").eq("patient_id", id).order("appointment_date", { ascending: false }).limit(5),
      supabase.from("treatments").select("*, procedure:procedures(name_ar)").eq("patient_id", id).order("treatment_date", { ascending: false }).limit(5),
    ]).then(([p, a, t]) => {
      setPatient(p.data);
      setAppointments(a.data ?? []);
      setTreatments((t.data ?? []) as Treatment[]);
    });
  }, [id, supabase]);

  if (!patient) {
    return <div className="py-12 text-center text-slate-400">جاري التحميل...</div>;
  }

  return (
    <div>
      <PageHeader
        title={patient.full_name}
        description={`ملف رقم ${patient.file_number}`}
        action={
          <div className="flex gap-2">
            <Link href={`/dental-chart?patient=${patient.id}`}>
              <Button variant="ghost"><Smile size={16} className="ml-2 inline" />المخطط السني</Button>
            </Link>
            <Link href={`/appointments/new?patient=${patient.id}`}>
              <Button><Calendar size={16} className="ml-2 inline" />موعد جديد</Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="معلومات المريض" className="lg:col-span-1">
          <dl className="space-y-3 text-sm">
            <div><dt className="text-slate-500">رقم الملف</dt><dd className="font-medium"><Badge>{patient.file_number}</Badge></dd></div>
            <div><dt className="text-slate-500">الهاتف</dt><dd className="font-medium" dir="ltr">{patient.phone ?? "—"}</dd></div>
            <div><dt className="text-slate-500">البريد</dt><dd className="font-medium" dir="ltr">{patient.email ?? "—"}</dd></div>
            <div><dt className="text-slate-500">تاريخ الميلاد</dt><dd className="font-medium">{patient.date_of_birth ?? "—"}</dd></div>
            <div><dt className="text-slate-500">الجنس</dt><dd className="font-medium">{patient.gender === "male" ? "ذكر" : patient.gender === "female" ? "أنثى" : "—"}</dd></div>
            {patient.allergies && <div><dt className="text-slate-500">الحساسية</dt><dd className="font-medium text-rose-600">{patient.allergies}</dd></div>}
            {patient.medical_notes && <div><dt className="text-slate-500">ملاحظات طبية</dt><dd className="font-medium">{patient.medical_notes}</dd></div>}
          </dl>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card title="آخر المواعيد" action={<Link href="/appointments" className="text-sm text-cyan-600">عرض الكل</Link>}>
            {appointments.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-400">لا توجد مواعيد</p>
            ) : (
              <div className="space-y-2">
                {appointments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
                    <span>{a.appointment_date} — {a.start_time?.slice(0, 5)}</span>
                    <Badge>{APPOINTMENT_STATUS_LABELS[a.status]}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="آخر العلاجات" action={<Link href="/treatments" className="text-sm text-cyan-600">عرض الكل</Link>}>
            {treatments.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-400">لا توجد علاجات</p>
            ) : (
              <div className="space-y-2">
                {treatments.map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
                    <span><Stethoscope size={14} className="ml-1 inline" />{t.procedure?.name_ar ?? t.description ?? "علاج"}</span>
                    <span className="text-slate-500">{t.treatment_date}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
