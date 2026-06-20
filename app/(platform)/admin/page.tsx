"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader, Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/status-badge";
import { TableSkeleton } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast-store";
import type { Clinic } from "@/lib/types/database";
import { Building2, Power, PowerOff, TrendingUp, Globe } from "lucide-react";
import { BRAND } from "@/lib/brand";

export default function AdminDashboardPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const load = async () => {
    const { data } = await supabase.from("clinics").select("*").order("created_at", { ascending: false });
    setClinics(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (clinic: Clinic) => {
    await supabase.from("clinics").update({ is_active: !clinic.is_active }).eq("id", clinic.id);
    toast.success(clinic.is_active ? "تم إيقاف العيادة" : "تم تفعيل العيادة");
    load();
  };

  const active = clinics.filter((c) => c.is_active).length;

  return (
    <div>
      <PageHeader
        title="لوحة المنصة"
        description={`${BRAND.name} — ${BRAND.domain}`}
        badge={<Badge variant="gold">Super Admin</Badge>}
        dark
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "إجمالي العيادات", value: clinics.length, icon: Building2, color: "text-amber-400" },
          { label: "عيادات نشطة", value: active, icon: Power, color: "text-emerald-400" },
          { label: "موقوفة", value: clinics.length - active, icon: PowerOff, color: "text-rose-400" },
          { label: "النمو", value: "+12%", icon: TrendingUp, color: "text-cyan-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur">
            <Icon size={22} className={`mb-3 ${color}`} />
            <p className="text-3xl font-black text-white">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <Card title="جميع العيادات المشتركة" dark className="!border-white/5">
        {loading ? <TableSkeleton /> : clinics.length === 0 ? (
          <p className="py-12 text-center text-slate-500">لا توجد عيادات بعد</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-4 py-3 text-right font-bold text-slate-400">العيادة</th>
                  <th className="px-4 py-3 text-right font-bold text-slate-400">البريد</th>
                  <th className="px-4 py-3 text-right font-bold text-slate-400">المدينة</th>
                  <th className="px-4 py-3 text-right font-bold text-slate-400">الحالة</th>
                  <th className="px-4 py-3 text-right font-bold text-slate-400">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {clinics.map((c) => (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Globe size={14} className="text-amber-500/50" />
                        <span className="font-bold text-white">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400" dir="ltr">{c.email ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-400">{c.city ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={c.is_active ? "cyan" : "default"}>{c.is_active ? "نشطة" : "موقوفة"}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant={c.is_active ? "danger" : "primary"} onClick={() => toggleActive(c)}>
                        {c.is_active ? "إيقاف" : "تفعيل"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
