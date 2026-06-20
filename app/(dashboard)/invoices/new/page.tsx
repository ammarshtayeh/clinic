"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useClinic } from "@/lib/hooks/use-clinic";
import { PageHeader, Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Patient } from "@/lib/types/database";

export default function NewInvoicePage() {
  const { clinic } = useClinic();
  const router = useRouter();
  const supabase = createClient();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    patient_id: "",
    description: "",
    quantity: "1",
    unit_price: "",
    discount: "0",
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

    const qty = parseInt(form.quantity) || 1;
    const price = parseFloat(form.unit_price) || 0;
    const discount = parseFloat(form.discount) || 0;
    const subtotal = qty * price;
    const total = subtotal - discount;

    const { data: invoiceNumber } = await supabase.rpc("generate_invoice_number", { p_clinic_id: clinic.id });

    const { data: invoice, error } = await supabase.from("invoices").insert({
      clinic_id: clinic.id,
      patient_id: form.patient_id,
      invoice_number: invoiceNumber ?? `INV-${Date.now()}`,
      subtotal,
      discount,
      total,
      status: "issued",
      issued_at: new Date().toISOString(),
    }).select().single();

    if (!error && invoice) {
      await supabase.from("invoice_items").insert({
        invoice_id: invoice.id,
        description: form.description,
        quantity: qty,
        unit_price: price,
        total: subtotal,
      });
    }

    router.push("/invoices");
  };

  return (
    <div>
      <PageHeader title="فاتورة جديدة" />
      <Card>
        <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-4">
          <Select
            label="المريض *"
            value={form.patient_id}
            onChange={(e) => setForm((f) => ({ ...f, patient_id: e.target.value }))}
            options={[{ value: "", label: "اختر..." }, ...patients.map((p) => ({ value: p.id, label: `${p.full_name} (#${p.file_number})` }))]}
          />
          <Input label="وصف البند *" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} required />
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="الكمية" type="number" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} dir="ltr" />
            <Input label="سعر الوحدة (₪)" type="number" value={form.unit_price} onChange={(e) => setForm((f) => ({ ...f, unit_price: e.target.value }))} required dir="ltr" />
            <Input label="الخصم (₪)" type="number" value={form.discount} onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))} dir="ltr" />
          </div>
          <div className="flex gap-3">
            <Button type="submit" loading={loading}>إصدار الفاتورة</Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>إلغاء</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
