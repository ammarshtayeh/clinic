"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BRAND, MOCK_ACCOUNTS } from "@/lib/brand";
import { isMockMode } from "@/lib/mock/config";
import { createClient } from "@/lib/supabase/client";
import { Shield, Building2, BarChart3, Lock, ArrowRight } from "lucide-react";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isMockMode()) {
        const res = await fetch("/api/auth/admin-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
          setError("بيانات الدخول غير صحيحة — Super Admin فقط");
          setLoading(false);
          return;
        }
      } else {
        const supabase = createClient();
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) {
          setError("بيانات الدخول غير صحيحة");
          setLoading(false);
          return;
        }
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("حدث خطأ — حاول مجدداً");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0f18]">
      {/* Admin hero */}
      <div className="hidden w-[52%] flex-col justify-between bg-gradient-to-br from-[#1c1408] via-[#292017] to-[#0a0f18] p-12 lg:flex">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-amber-200/60 hover:text-amber-200">
            <ArrowRight size={16} />
            العودة للرئيسية
          </Link>
          <div className="mt-10 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 shadow-lg shadow-amber-500/20">
              <Shield size={26} />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{BRAND.name}</p>
              <p className="text-sm text-amber-200/60">{BRAND.adminPortal.title}</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-4xl font-black leading-tight text-white">
            تحكم كامل<br />
            <span className="text-amber-400">بالمنصة</span>
          </h2>
          <p className="mt-4 max-w-md text-slate-400">{BRAND.adminPortal.subtitle}</p>
          <div className="mt-10 space-y-3">
            {[
              { icon: Building2, label: "إنشاء العيادات وبيع الحسابات" },
              { icon: BarChart3, label: "إدارة الاشتراكات والمقاعد" },
              { icon: Lock, label: "مدير نظام مستقل · غير مرتبط بعيادة" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 rounded-2xl border border-amber-500/10 bg-amber-500/5 px-4 py-3">
                <Icon size={18} className="text-amber-400" />
                <span className="text-sm font-semibold text-slate-200">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-600">Platform Console · {BRAND.domain}</p>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900">
              <Shield size={26} />
            </div>
            <h1 className="text-xl font-black text-white">{BRAND.adminPortal.title}</h1>
          </div>

          <div className="rounded-3xl border border-amber-500/15 bg-slate-900/80 p-8 shadow-2xl backdrop-blur">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                <Shield size={22} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">دخول المنصة</h2>
                <p className="text-xs text-slate-500">Super Admin · Asnany Platform</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-400">{error}</div>
              )}
              <Input label="البريد الإلكتروني" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required dir="ltr" className="!bg-slate-800 !border-slate-700 !text-white" />
              <Input label="كلمة المرور" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required dir="ltr" className="!bg-slate-800 !border-slate-700 !text-white" />
              <Button type="submit" loading={loading} className="gold-button w-full" size="lg">دخول Admin</Button>

              {isMockMode() && (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-200/90">
                  <p className="mb-1 font-black">حساب Admin تجريبي:</p>
                  <p dir="ltr">{MOCK_ACCOUNTS.admin.email} / {MOCK_ACCOUNTS.admin.password}</p>
                </div>
              )}
            </form>

            <p className="mt-6 text-center text-xs text-slate-500">
              طبيب أو موظف عيادة؟{" "}
              <Link href="/login" className="font-bold text-cyan-400 hover:underline">دخول العيادة</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
