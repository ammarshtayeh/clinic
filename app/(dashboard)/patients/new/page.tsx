"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useClinic } from "@/lib/hooks/use-clinic";
import { PageHeader, Card } from "@/components/ui/card";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast-store";
import { logAudit } from "@/lib/audit";

export default function NewPatientPage() {
  const { clinic } = useClinic();
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "", phone: "", email: "", date_of_birth: "", gender: "",
    address: "", medical_notes: "", allergies: "",
  });

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinic) return;
    setLoading(true);

    const { data: fileNumber } = await supabase.rpc("generate_file_number", { p_clinic_id: clinic.id });
    const { error } = await supabase.from("patients").insert({
      clinic_id: clinic.id, file_number: fileNumber ?? "0001",
      full_name: form.full_name, phone: form.phone || null, email: form.email || null,
      date_of_birth: form.date_of_birth || null, gender: form.gender || null,
      address: form.address || null, medical_notes: form.medical_notes || null, allergies: form.allergies || null,
    });

    if (error) { toast.error(error.message); setLoading(false); return; }
    await logAudit(clinic.id, "create_patient", "patient");
    toast.success("تم إضافة المريض بنجاح");
    router.push("/patients");
  };

  return (
    <div>
      <PageHeader title="مريض جديد" description="إضافة مريض جديد للعيادة" />
      <Card>
        <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-4">
          <Input label="الاسم الكامل *" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} required />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="الهاتف" value={form.phone} onChange={(e) => update("phone", e.target.value)} dir="ltr" />
            <Input label="البريد" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} dir="ltr" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="تاريخ الميلاد" type="date" value={form.date_of_birth} onChange={(e) => update("date_of_birth", e.target.value)} dir="ltr" />
            <Select label="الجنس" value={form.gender} onChange={(e) => update("gender", e.target.value)}
              options={[{ value: "", label: "اختر..." }, { value: "male", label: "ذكر" }, { value: "female", label: "أنثى" }]} />
          </div>
          <Input label="العنوان" value={form.address} onChange={(e) => update("address", e.target.value)} />
          <Textarea label="الحساسية" value={form.allergies} onChange={(e) => update("allergies", e.target.value)} />
          <Textarea label="ملاحظات طبية" value={form.medical_notes} onChange={(e) => update("medical_notes", e.target.value)} />
          <div className="flex gap-3">
            <Button type="submit" loading={loading}>حفظ</Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>إلغاء</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
