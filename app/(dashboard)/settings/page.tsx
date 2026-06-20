"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useClinic } from "@/lib/hooks/use-clinic";
import { PageHeader, Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast-store";
import { logAudit } from "@/lib/audit";
import { BRAND } from "@/lib/brand";
import { Upload, Lock, Building2 } from "lucide-react";
import Image from "next/image";

export default function SettingsPage() {
  const { clinic, membership, refresh } = useClinic();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", city: "" });
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const isOwner = membership?.role === "owner";

  useEffect(() => {
    if (clinic) setForm({
      name: clinic.name ?? "", phone: clinic.phone ?? "",
      email: clinic.email ?? "", address: clinic.address ?? "", city: clinic.city ?? "",
    });
  }, [clinic]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinic || !isOwner) return;
    setLoading(true);
    await supabase.from("clinics").update({
      name: form.name, phone: form.phone || null, email: form.email || null,
      address: form.address || null, city: form.city || null,
    }).eq("id", clinic.id);
    await logAudit(clinic.id, "update_clinic_settings", "clinic", clinic.id);
    toast.success("تم حفظ الإعدادات");
    setLoading(false);
    refresh();
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !clinic) return;
    const ext = file.name.split(".").pop();
    const path = `${clinic.id}/logo.${ext}`;
    const { error } = await supabase.storage.from("clinic-logos").upload(path, file, { upsert: true });
    if (error) { toast.error("فشل رفع الشعار"); return; }
    const { data: { publicUrl } } = supabase.storage.from("clinic-logos").getPublicUrl(path);
    await supabase.from("clinics").update({ logo_url: `${publicUrl}?t=${Date.now()}` }).eq("id", clinic.id);
    toast.success("تم رفع الشعار");
    refresh();
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) { toast.error("كلمتا المرور غير متطابقتين"); return; }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwForm.newPw });
    setPwLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("تم تغيير كلمة المرور");
    setPwForm({ current: "", newPw: "", confirm: "" });
  };

  return (
    <div>
      <PageHeader title="الإعدادات" description={`إدارة ${clinic?.name ?? "عيادتك"}`} />

      <div className="grid gap-6 lg:grid-cols-2">
        {isOwner && (
          <Card title="معلومات العيادة" action={<Building2 size={20} className="text-slate-400" />}>
            <div className="mb-6 flex items-center gap-4">
              {clinic?.logo_url ? (
                <Image src={clinic.logo_url} alt="" width={64} height={64} className="h-16 w-16 rounded-2xl object-cover ring-2 ring-cyan-200" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 text-2xl font-black text-white">A</div>
              )}
              <div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                <Button size="sm" variant="ghost" onClick={() => fileRef.current?.click()}>
                  <Upload size={14} className="ml-1 inline" />رفع شعار
                </Button>
              </div>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <Input label="اسم العيادة" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="الهاتف" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} dir="ltr" />
                <Input label="البريد" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} dir="ltr" />
              </div>
              <Input label="العنوان" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
              <Input label="المدينة" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
              <Button type="submit" loading={loading}>حفظ التغييرات</Button>
            </form>
          </Card>
        )}

        <Card title="كلمة المرور" action={<Lock size={20} className="text-slate-400" />}>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <Input label="كلمة المرور الجديدة" type="password" value={pwForm.newPw} onChange={(e) => setPwForm((f) => ({ ...f, newPw: e.target.value }))} required dir="ltr" />
            <Input label="تأكيد كلمة المرور" type="password" value={pwForm.confirm} onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))} required dir="ltr" />
            <Button type="submit" loading={pwLoading}>تغيير كلمة المرور</Button>
          </form>
        </Card>

        <Card title="عن المنصة" className="lg:col-span-2">
          <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-l from-slate-900 to-slate-800 p-6 text-white">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 text-xl font-black">A</div>
            <div>
              <p className="text-lg font-black">{BRAND.name}</p>
              <p className="text-sm text-slate-400">{BRAND.domain} · {BRAND.tagline}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
