"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { toast } from "@/lib/toast-store";

export function RegisterForm() {
  const [form, setForm] = useState({ fullName: "", clinicName: "", phone: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error("كلمتا المرور غير متطابقتين"); return; }
    if (form.password.length < 6) { toast.error("6 أحرف على الأقل"); return; }
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { data: { full_name: form.fullName, clinic_name: form.clinicName, phone: form.phone } },
    });

    if (error) { toast.error(error.message); setLoading(false); return; }
    await fetch("/api/clinic/seed", { method: "POST" });
    toast.success("تم إنشاء عيادتك!");
    router.push("/dashboard");
  };

  return (
    <div className="auth-bg flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-lg premium-card">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 text-2xl font-black text-white">A</div>
          <h1 className="text-2xl font-black">{BRAND.name}</h1>
          <p className="text-sm text-slate-500">تسجيل عيادة جديدة</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="اسمك" value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} required />
          <Input label="اسم العيادة" value={form.clinicName} onChange={(e) => setForm((f) => ({ ...f, clinicName: e.target.value }))} required />
          <Input label="الهاتف" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} dir="ltr" />
          <Input label="البريد" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required dir="ltr" />
          <Input label="كلمة المرور" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required dir="ltr" />
          <Input label="تأكيد كلمة المرور" type="password" value={form.confirmPassword} onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))} required dir="ltr" />
          <Button type="submit" loading={loading} className="w-full" size="lg">إنشاء الحساب</Button>
          <p className="text-center text-sm text-slate-500">لديك حساب؟ <Link href="/login" className="font-bold text-cyan-600">دخول</Link></p>
        </form>
      </div>
    </div>
  );
}
