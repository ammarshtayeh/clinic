"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Smile } from "lucide-react";

export function RegisterForm() {
  const [form, setForm] = useState({
    fullName: "",
    clinicName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    if (form.password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setLoading(true);

    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          clinic_name: form.clinicName,
          phone: form.phone,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const clinicId = data.user.user_metadata?.clinic_id;
      if (!clinicId) {
        await fetch("/api/clinic/seed", { method: "POST" });
      }
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-700 text-white shadow-lg">
            <Smile size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">سجّل عيادتك</h1>
          <p className="mt-2 text-sm text-slate-500">أنشئ حسابك وابدأ بإدارة عيادتك فوراً</p>
        </div>

        <form onSubmit={handleSubmit} className="section-shell space-y-4">
          {error && (
            <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
          )}
          <Input
            label="اسمك الكامل"
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            required
            placeholder="د. أحمد محمد"
          />
          <Input
            label="اسم العيادة"
            value={form.clinicName}
            onChange={(e) => update("clinicName", e.target.value)}
            required
            placeholder="عيادة الابتسامة"
          />
          <Input
            label="رقم الهاتف"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            dir="ltr"
            placeholder="0599123456"
          />
          <Input
            label="البريد الإلكتروني"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
            dir="ltr"
            placeholder="doctor@clinic.com"
          />
          <Input
            label="كلمة المرور"
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            required
            dir="ltr"
          />
          <Input
            label="تأكيد كلمة المرور"
            type="password"
            value={form.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
            required
            dir="ltr"
          />
          <Button type="submit" loading={loading} className="w-full">
            إنشاء الحساب
          </Button>
          <p className="text-center text-sm text-slate-500">
            لديك حساب؟{" "}
            <Link href="/login" className="font-semibold text-cyan-600 hover:underline">
              تسجيل الدخول
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
