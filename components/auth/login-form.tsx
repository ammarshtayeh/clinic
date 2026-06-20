"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Smile } from "lucide-react";

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
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-700 text-white shadow-lg">
            <Smile size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">نظام إدارة عيادات الأسنان</h1>
          <p className="mt-2 text-sm text-slate-500">سجّل دخولك لإدارة عيادتك</p>
        </div>

        <form onSubmit={handleSubmit} className="section-shell space-y-4">
          {error && (
            <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
          )}
          <Input
            label="البريد الإلكتروني"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            dir="ltr"
            placeholder="doctor@clinic.com"
          />
          <Input
            label="كلمة المرور"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            dir="ltr"
          />
          <Button type="submit" loading={loading} className="w-full">
            تسجيل الدخول
          </Button>
          <p className="text-center text-sm text-slate-500">
            ليس لديك حساب؟{" "}
            <Link href="/register" className="font-semibold text-cyan-600 hover:underline">
              سجّل عيادتك الآن
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
