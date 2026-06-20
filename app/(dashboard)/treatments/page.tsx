"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useClinic } from "@/lib/hooks/use-clinic";
import { PageHeader, Card, EmptyState, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Treatment } from "@/lib/types/database";
import { Plus } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  planned: "مخطط",
  in_progress: "جاري",
  completed: "مكتمل",
  cancelled: "ملغي",
};

export default function TreatmentsPage() {
  const { clinic } = useClinic();
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!clinic) return;
    supabase
      .from("treatments")
      .select("*, patient:patients(full_name, file_number), procedure:procedures(name_ar)")
      .eq("clinic_id", clinic.id)
      .order("treatment_date", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setTreatments((data ?? []) as Treatment[]);
        setLoading(false);
      });
  }, [clinic, supabase]);

  return (
    <div>
      <PageHeader
        title="العلاجات"
        description="سجل العلاجات والإجراءات"
        action={
          <Link href="/treatments/new">
            <Button><Plus size={16} className="ml-2 inline" />علاج جديد</Button>
          </Link>
        }
      />

      <Card>
        {loading ? (
          <div className="py-12 text-center text-slate-400">جاري التحميل...</div>
        ) : treatments.length === 0 ? (
          <EmptyState title="لا توجد علاجات مسجلة" />
        ) : (
          <div className="table-shell">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-4 py-3 text-right font-medium text-slate-600">المريض</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">الإجراء</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">السن</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">التاريخ</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">التكلفة</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {treatments.map((t) => (
                  <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium">{t.patient?.full_name}</td>
                    <td className="px-4 py-3">{t.procedure?.name_ar ?? t.description ?? "—"}</td>
                    <td className="px-4 py-3">{t.tooth_number ?? "—"}</td>
                    <td className="px-4 py-3">{t.treatment_date}</td>
                    <td className="px-4 py-3">{t.cost} ₪</td>
                    <td className="px-4 py-3"><Badge>{STATUS_LABELS[t.status]}</Badge></td>
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
