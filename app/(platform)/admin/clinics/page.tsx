"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader, Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/status-badge";
import { TableSkeleton } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast-store";
import type { Clinic } from "@/lib/types/database";
import { Building2 } from "lucide-react";
import { BRAND } from "@/lib/brand";

export default function AdminClinicsPage() {
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
      <PageHeader title="إدارة العيادات" description="تفعيل وإيقاف اشتراكات العيادات" badge={<Badge variant="gold">{clinics.length} عيادة</Badge>} dark />

      <Card title="قائمة العيادات" dark className="!border-white/5">
        {loading ? <TableSkeleton /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-4 py-3 text-right font-bold text-slate-400">العيادة</th>
                  <th className="px-4 py-3 text-right font-bold text-slate-400">المدينة</th>
                  <th className="px-4 py-3 text-right font-bold text-slate-400">الحالة</th>
                  <th className="px-4 py-3 text-right font-bold text-slate-400">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {clinics.map((c) => (
                  <tr key={c.id} className="border-b border-white/5">
                    <td className="px-4 py-3 font-bold text-white">{c.name}</td>
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
