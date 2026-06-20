"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useClinic } from "@/lib/hooks/use-clinic";
import { PageHeader, Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { clinic, membership, refresh } = useClinic();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
  });

  useEffect(() => {
    if (clinic) {
      setForm({
        name: clinic.name ?? "",
        phone: clinic.phone ?? "",
        email: clinic.email ?? "",
        address: clinic.address ?? "",
        city: clinic.city ?? "",
      });
    }
  }, [clinic]);

  const isOwner = membership?.role === "owner";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinic || !isOwner) return;
    setLoading(true);
    await supabase.from("clinics").update({
      name: form.name,
      phone: form.phone || null,
      email: form.email || null,
      address: form.address || null,
      city: form.city || null,
    }).eq("id", clinic.id);
    setLoading(false);
    setSaved(true);
    refresh();
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <PageHeader title="إعدادات العيادة" description="تعديل معلومات العيادة" />

      <Card>
        {!isOwner ? (
          <p className="py-8 text-center text-sm text-slate-500">فقط مالك العيادة يمكنه تعديل الإعدادات</p>
        ) : (
          <form onSubmit={handleSave} className="mx-auto max-w-2xl space-y-4">
            {saved && <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">تم حفظ التغييرات بنجاح</div>}
            <Input label="اسم العيادة" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="الهاتف" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} dir="ltr" />
              <Input label="البريد الإلكتروني" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} dir="ltr" />
            </div>
            <Input label="العنوان" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
            <Input label="المدينة" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
            <Button type="submit" loading={loading}>حفظ التغييرات</Button>
          </form>
        )}
      </Card>
    </div>
  );
}
