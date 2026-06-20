"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useClinic } from "@/lib/hooks/use-clinic";
import { PageHeader, Card, EmptyState } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/ui/dialog";
import type { Treatment } from "@/lib/types/database";
import { Plus } from "lucide-react";

export default function TreatmentsPage() {
  const { clinic } = useClinic();
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!clinic) return;
    supabase.from("treatments").select("*, patient:patients(full_name, file_number), procedure:procedures(name_ar)")
      .eq("clinic_id", clinic.id).order("treatment_date", { ascending: false }).limit(50)
      .then(({ data }) => { setTreatments((data ?? []) as Treatment[]); setLoading(false); });
  }, [clinic, supabase]);

  return (
    <div>
      <PageHeader title="العلاجات" action={<Link href="/treatments/new"><Button size="sm"><Plus size={16} className="ml-1 inline" />جديد</Button></Link>} />
      <Card>
        {loading ? <TableSkeleton /> : treatments.length === 0 ? (
          <EmptyState title="لا علاجات مسجلة" />
        ) : (
          <div className="space-y-2">
            {treatments.map((t) => (
              <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 p-4 hover:border-cyan-200">
                <div>
                  <p className="font-bold">{t.patient?.full_name}</p>
                  <p className="text-sm text-slate-500">{t.procedure?.name_ar ?? t.description ?? "—"} · {t.treatment_date} · {t.cost} ₪</p>
                </div>
                <StatusBadge status={t.status} type="treatment" />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
