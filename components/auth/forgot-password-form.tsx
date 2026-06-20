"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { toast } from "@/lib/toast-store";
import { ArrowRight } from "lucide-react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setSent(true);
    toast.success("تم إرسال رابط إعادة التعيين");
  };

  return (
    <div className="auth-bg flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md premium-card">
        <Link href="/login" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-cyan-600">
          <ArrowRight size={16} /> العودة لتسجيل الدخول
        </Link>
        <h2 className="text-xl font-black text-slate-900">نسيت كلمة المرور؟</h2>
        <p className="mt-2 text-sm text-slate-500">سنرسل رابط إعادة التعيين إلى بريدك</p>

        {sent ? (
          <div className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
            تحقق من بريدك الإلكتروني — أرسلنا رابط إعادة تعيين كلمة المرور.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input label="البريد الإلكتروني" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required dir="ltr" />
            <Button type="submit" loading={loading} className="w-full">إرسال الرابط</Button>
          </form>
        )}
        <p className="mt-6 text-center text-xs text-slate-400">{BRAND.name} · {BRAND.domain}</p>
      </div>
    </div>
  );
}
