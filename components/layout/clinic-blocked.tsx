"use client";

import { useClinic } from "@/lib/hooks/use-clinic";
import { BRAND } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function ClinicBlocked() {
  const supabase = createClient();
  const router = useRouter();

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-500/20 text-4xl">⛔</div>
        <h1 className="text-2xl font-black text-white">الاشتراك موقوف</h1>
        <p className="mt-3 text-slate-400">تم إيقاف حساب عيادتك. تواصل مع {BRAND.name} لتجديد الاشتراك.</p>
        <p className="mt-2 text-sm text-cyan-400">{BRAND.domain}</p>
        <Button onClick={logout} variant="ghost" className="mt-8 !text-white !border-white/20">تسجيل الخروج</Button>
      </div>
    </div>
  );
}
