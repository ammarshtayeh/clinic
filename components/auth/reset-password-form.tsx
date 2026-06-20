"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast-store";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error("كلمتا المرور غير متطابقتين"); return; }
    if (password.length < 6) { toast.error("6 أحرف على الأقل"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("تم تغيير كلمة المرور");
    router.push("/dashboard");
  };

  return (
    <div className="auth-bg flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md premium-card">
        <h2 className="text-xl font-black text-slate-900">كلمة مرور جديدة</h2>
        <p className="mt-2 text-sm text-slate-500">اختر كلمة مرور قوية لحسابك</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input label="كلمة المرور الجديدة" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required dir="ltr" />
          <Input label="تأكيد كلمة المرور" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required dir="ltr" />
          <Button type="submit" loading={loading} className="w-full">حفظ كلمة المرور</Button>
        </form>
      </div>
    </div>
  );
}
