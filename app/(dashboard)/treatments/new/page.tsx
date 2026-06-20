"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useClinic } from "@/lib/hooks/use-clinic";
import { PageHeader, Card } from "@/components/ui/card";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Patient, Procedure } from "@/lib/types/database";

export default function NewTreatmentPage() {
  const { clinic } = useClinic();
  const router = useRouter();
  const supabase = createClient();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    patient_id: "", procedure_id: "", tooth_number: "", treatment_date: new Date().toISOString().slice(0, 10),
    cost: "", notes: "", status: "planned",
  });

  useEffect(() => {
    if (!clinic) return;
    Promise.all([
      supabase.from("patients").select("id, full_name, file_number").eq("clinic_id", clinic.id).eq("is_active", true),
      supabase.from("procedures").select("*").eq("clinic_id", clinic.id).eq("is_active", true),
    ]).then(([p, pr]) => {
      setPatients((p.data ?? []) as Patient[]);
      setProcedures((pr.data ?? []) as Procedure[]);
    });
  }, [clinic, supabase]);

  const handleProcedureChange = (id: string) => {
    const proc = procedures.find((p) => p.id === id);
    setForm((f) => ({ ...f, procedure_id: id, cost: proc ? String(proc.price) : f.cost }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinic) return;
    setLoading(true);

    await supabase.from("treatments").insert({
      clinic_id: clinic.id,
      patient_id: form.patient_id,
      procedure_id: form.procedure_id || null,
      tooth_number: form.tooth_number ? parseInt(form.tooth_number) : null,
      treatment_date: form.treatment_date,
      cost: parseFloat(form.cost) || 0,
      notes: form.notes || null,
      status: form.status as "planned",
    });

    router.push("/treatments");
  };

  return (
    <div>
      <PageHeader title="علاج جديد" />
      <Card>
        <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-4">
          <Select
            label="المريض *"
            value={form.patient_id}
            onChange={(e) => setForm((f) => ({ ...f, patient_id: e.target.value }))}
            options={[{ value: "", label: "اختر..." }, ...patients.map((p) => ({ value: p.id, label: `${p.full_name} (#${p.file_number})` }))]}
          />
          <Select
            label="الإجراء"
            value={form.procedure_id}
            onChange={(e) => handleProcedureChange(e.target.value)}
            options={[{ value: "", label: "اختر..." }, ...procedures.map((p) => ({ value: p.id, label: `${p.name_ar} — ${p.price} ₪` }))]}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="رقم السن (FDI)" value={form.tooth_number} onChange={(e) => setForm((f) => ({ ...f, tooth_number: e.target.value }))} placeholder="مثال: 16" dir="ltr" />
            <Input label="التاريخ" type="date" value={form.treatment_date} onChange={(e) => setForm((f) => ({ ...f, treatment_date: e.target.value }))} dir="ltr" />
            <Input label="التكلفة (₪)" type="number" value={form.cost} onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))} dir="ltr" />
          </div>
          <Textarea label="ملاحظات" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          <div className="flex gap-3">
            <Button type="submit" loading={loading}>حفظ العلاج</Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>إلغاء</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
