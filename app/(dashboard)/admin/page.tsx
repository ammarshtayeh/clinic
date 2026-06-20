"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader, Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/status-badge";
import { TableSkeleton } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast-store";
import type { Clinic } from "@/lib/types/database";
import { Building2, Users, Power, PowerOff } from "lucide-react";
import { BRAND } from "@/lib/brand";

export default function AdminPage() {
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

  return (
    <div>
      <PageHeader
        title="إدارة Asnany"
        description={`لوحة تحكم المنصة — ${BRAND.domain}`}
        badge={<Badge variant="gold">Super Admin</Badge>}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card dark className="!p-5">
          <Building2 size={24} className="mb-2 text-cyan-400" />
          <p className="text-3xl font-black">{clinics.length}</p>
          <p className="text-sm text-slate-400">إجمالي العيادات</p>
        </Card>
        <Card dark className="!p-5">
          <Power size={24} className="mb-2 text-emerald-400" />
          <p className="text-3xl font-black">{clinics.filter((c) => c.is_active).length}</p>
          <p className="text-sm text-slate-400">عيادات نشطة</p>
        </Card>
        <Card dark className="!p-5">
          <PowerOff size={24} className="mb-2 text-rose-400" />
          <p className="text-3xl font-black">{clinics.filter((c) => !c.is_active).length}</p>
          <p className="text-sm text-slate-400">عيادات موقوفة</p>
        </Card>
      </div>

      <Card title="جميع العيادات">
        {loading ? <TableSkeleton /> : (
          <div className="table-shell">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="px-4 py-3 text-right font-bold text-slate-600">العيادة</th>
                  <th className="px-4 py-3 text-right font-bold text-slate-600">البريد</th>
                  <th className="px-4 py-3 text-right font-bold text-slate-600">المدينة</th>
                  <th className="px-4 py-3 text-right font-bold text-slate-600">الحالة</th>
                  <th className="px-4 py-3 text-right font-bold text-slate-600">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {clinics.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-bold">{c.name}</td>
                    <td className="px-4 py-3" dir="ltr">{c.email ?? "—"}</td>
                    <td className="px-4 py-3">{c.city ?? "—"}</td>
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
