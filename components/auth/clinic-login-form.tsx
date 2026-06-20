"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BRAND, MOCK_ACCOUNTS } from "@/lib/brand";
import { isMockMode } from "@/lib/mock/config";
import { Stethoscope, Users, Calendar, FileText, ArrowRight } from "lucide-react";

export function ClinicLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen bg-[#f4f7fb]">
      {/* Clinical hero panel */}
      <div className="hidden w-[52%] flex-col justify-between bg-gradient-to-br from-[#0c4a6e] via-[#0e7490] to-[#06b6d4] p-12 lg:flex">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-100/80 hover:text-white">
            <ArrowRight size={16} />
            العودة للرئيسية
          </Link>
          <div className="mt-10 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl font-black text-white backdrop-blur">
              A
            </div>
            <div>
              <p className="text-2xl font-black text-white">{BRAND.name}</p>
              <p className="text-sm text-cyan-100/70">{BRAND.clinicPortal.title}</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-4xl font-black leading-tight text-white">
            عيادتك<br />تحت السيطرة
          </h2>
          <p className="mt-4 max-w-md text-cyan-100/80">{BRAND.description}</p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { icon: Users, label: "إدارة المرضى" },
              { icon: Calendar, label: "جدولة المواعيد" },
              { icon: Stethoscope, label: "المخطط السني" },
              { icon: FileText, label: "الفواتير" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                <Icon size={18} className="text-cyan-200" />
                <span className="text-sm font-semibold text-white">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-cyan-200/50">© {new Date().getFullYear()} {BRAND.domain}</p>
      </div>

      {/* Form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-700 text-2xl font-black text-white">
              A
            </div>
            <h1 className="text-xl font-black text-slate-900">{BRAND.clinicPortal.title}</h1>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/50">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <Stethoscope size={22} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">تسجيل الدخول</h2>
                <p className="text-xs text-slate-500">طبيب · استقبال · محاسبة · مالك عيادة</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</div>
              )}
              <Input label="البريد الإلكتروني" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required dir="ltr" placeholder="doctor@clinic.com" />
              <Input label="كلمة المرور" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required dir="ltr" />
              <div className="text-left">
                <Link href="/forgot-password" className="text-sm font-semibold text-cyan-600 hover:underline">نسيت كلمة المرور؟</Link>
              </div>
              <Button type="submit" loading={loading} className="w-full" size="lg">دخول العيادة</Button>

              {isMockMode() && (
                <div className="rounded-2xl border border-cyan-100 bg-cyan-50/50 p-4 text-xs text-cyan-900">
                  <p className="mb-2 font-black">حسابات تجريبية:</p>
                  <p dir="ltr"><strong>مالك:</strong> {MOCK_ACCOUNTS.owner.email} / {MOCK_ACCOUNTS.owner.password}</p>
                  <p dir="ltr" className="mt-1"><strong>طبيب:</strong> {MOCK_ACCOUNTS.doctor.email} / {MOCK_ACCOUNTS.doctor.password}</p>
                </div>
              )}
            </form>

            <p className="mt-6 text-center text-xs text-slate-400">
              مدير المنصة؟{" "}
              <Link href="/admin/login" className="font-bold text-amber-600 hover:underline">دخول Admin</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
