"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useClinic } from "@/lib/hooks/use-clinic";
import { PageHeader, Card } from "@/components/ui/card";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Patient } from "@/lib/types/database";

function NewAppointmentForm() {
  const { clinic } = useClinic();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    patient_id: searchParams.get("patient") ?? "",
    appointment_date: "",
    start_time: "",
    notes: "",
  });

  useEffect(() => {
    if (!clinic) return;
    supabase.from("patients").select("id, full_name, file_number").eq("clinic_id", clinic.id).eq("is_active", true)
      .then(({ data }) => setPatients((data ?? []) as Patient[]));
  }, [clinic, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinic) return;
    setLoading(true);
    setError("");

    const { error: insertError } = await supabase.from("appointments").insert({
      clinic_id: clinic.id,
      patient_id: form.patient_id,
      appointment_date: form.appointment_date,
      start_time: form.start_time,
      notes: form.notes || null,
      status: "scheduled",
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/appointments");
  };

  return (
    <div>
      <PageHeader title="موعد جديد" />
      <Card>
        <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-4">
          {error && <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
          <Select
            label="المريض *"
            value={form.patient_id}
            onChange={(e) => setForm((p) => ({ ...p, patient_id: e.target.value }))}
            options={[
              { value: "", label: "اختر المريض..." },
              ...patients.map((p) => ({ value: p.id, label: `${p.full_name} (#${p.file_number})` })),
            ]}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="التاريخ *" type="date" value={form.appointment_date} onChange={(e) => setForm((p) => ({ ...p, appointment_date: e.target.value }))} required dir="ltr" />
            <Input label="الوقت *" type="time" value={form.start_time} onChange={(e) => setForm((p) => ({ ...p, start_time: e.target.value }))} required dir="ltr" />
          </div>
          <Textarea label="ملاحظات" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
          <div className="flex gap-3">
            <Button type="submit" loading={loading}>حجز الموعد</Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>إلغاء</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function NewAppointmentPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-slate-400">جاري التحميل...</div>}>
      <NewAppointmentForm />
    </Suspense>
  );
}
