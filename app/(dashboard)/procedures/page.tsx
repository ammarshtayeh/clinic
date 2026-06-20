"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useClinic } from "@/lib/hooks/use-clinic";
import { PageHeader, Card, EmptyState } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Procedure } from "@/lib/types/database";
import { Plus } from "lucide-react";

export default function ProceduresPage() {
  const { clinic } = useClinic();
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name_ar: "", name_en: "", price: "", duration_minutes: "30" });
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const load = () => {
    if (!clinic) return;
    supabase.from("procedures").select("*").eq("clinic_id", clinic.id).eq("is_active", true)
      .then(({ data }) => setProcedures(data ?? []));
  };

  useEffect(() => { load(); }, [clinic, supabase]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinic) return;
    setLoading(true);
    await supabase.from("procedures").insert({
      clinic_id: clinic.id,
      name_ar: form.name_ar,
      name_en: form.name_en || null,
      price: parseFloat(form.price) || 0,
      duration_minutes: parseInt(form.duration_minutes) || 30,
    });
    setForm({ name_ar: "", name_en: "", price: "", duration_minutes: "30" });
    setShowForm(false);
    setLoading(false);
    load();
  };

  return (
    <div>
      <PageHeader
        title="كتالوج الإجراءات"
        description="إدارة إجراءات وأسعار العيادة"
        action={<Button onClick={() => setShowForm(!showForm)}><Plus size={16} className="ml-2 inline" />إجراء جديد</Button>}
      />

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Input label="الاسم بالعربية *" value={form.name_ar} onChange={(e) => setForm((f) => ({ ...f, name_ar: e.target.value }))} required />
            <Input label="الاسم بالإنجليزية" value={form.name_en} onChange={(e) => setForm((f) => ({ ...f, name_en: e.target.value }))} dir="ltr" />
            <Input label="السعر (₪)" type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required dir="ltr" />
            <Input label="المدة (دقيقة)" type="number" value={form.duration_minutes} onChange={(e) => setForm((f) => ({ ...f, duration_minutes: e.target.value }))} dir="ltr" />
            <div className="sm:col-span-2 lg:col-span-4">
              <Button type="submit" loading={loading}>إضافة</Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        {procedures.length === 0 ? (
          <EmptyState title="لا توجد إجراءات" description="أضف إجراءات العيادة وأسعارها" />
        ) : (
          <div className="table-shell">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-4 py-3 text-right font-medium text-slate-600">الإجراء</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">السعر</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">المدة</th>
                </tr>
              </thead>
              <tbody>
                {procedures.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50">
                    <td className="px-4 py-3 font-medium">{p.name_ar}{p.name_en && <span className="mr-2 text-xs text-slate-400">({p.name_en})</span>}</td>
                    <td className="px-4 py-3">{p.price} ₪</td>
                    <td className="px-4 py-3">{p.duration_minutes} دقيقة</td>
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
