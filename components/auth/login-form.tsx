"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BRAND, ALLOW_REGISTRATION } from "@/lib/brand";
import { isMockMode } from "@/lib/mock/config";
import { Sparkles, Shield, Zap } from "lucide-react";

export function LoginForm() {
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
    <div className="auth-bg flex min-h-screen">
      <div className="hidden flex-1 flex-col justify-between p-12 lg:flex">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 text-xl font-black text-white shadow-lg shadow-cyan-500/30">
              A
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{BRAND.name}</p>
              <p className="text-sm text-slate-500">{BRAND.domain}</p>
            </div>
          </div>
        </div>
        <div className="space-y-8">
          <h2 className="text-4xl font-black leading-tight text-slate-900">
            إدارة عيادتك<br />
            <span className="bg-gradient-to-l from-cyan-600 to-cyan-400 bg-clip-text text-transparent">باحترافية كاملة</span>
          </h2>
          <div className="space-y-4">
            {[
              { icon: Sparkles, text: "مرضى، مواعيد، فواتير — كل شيء في مكان واحد" },
              { icon: Shield, text: "بياناتك معزولة ومحمية 100%" },
              { icon: Zap, text: "سريع، سهل، يعمل على الجوال" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-slate-600">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                  <Icon size={18} className="text-cyan-600" />
                </div>
                <span className="font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-400">© {new Date().getFullYear()} {BRAND.name} · {BRAND.domain}</p>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 text-2xl font-black text-white">
              A
            </div>
            <h1 className="text-2xl font-black text-slate-900">{BRAND.name}</h1>
          </div>

          <div className="premium-card">
            <h2 className="mb-1 text-xl font-black text-slate-900">تسجيل الدخول</h2>
            <p className="mb-6 text-sm text-slate-500">أدخل بيانات حساب عيادتك</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</div>}
              <Input label="البريد الإلكتروني" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required dir="ltr" placeholder="doctor@clinic.com" />
              <Input label="كلمة المرور" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required dir="ltr" />
              <div className="text-left">
                <Link href="/forgot-password" className="text-sm font-semibold text-cyan-600 hover:underline">نسيت كلمة المرور؟</Link>
              </div>
              <Button type="submit" loading={loading} className="w-full" size="lg">دخول</Button>
          {isMockMode() ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
              <p className="mb-2 font-black">حسابات تجريبية:</p>
              <p dir="ltr"><strong>مالك:</strong> ammar.shtayeh@gmail.com / ammarking123</p>
              <p dir="ltr" className="mt-1"><strong>طبيب:</strong> ammar.ammar@gmail.com / ammarking123</p>
            </div>
          ) : null}
              {ALLOW_REGISTRATION && (
                <p className="text-center text-sm text-slate-500">
                  ليس لديك حساب؟ <Link href="/register" className="font-bold text-cyan-600">سجّل عيادتك</Link>
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
