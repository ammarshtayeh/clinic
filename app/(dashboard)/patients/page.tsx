"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useClinic } from "@/lib/hooks/use-clinic";
import { PageHeader, Card, EmptyState, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Patient } from "@/lib/types/database";
import { Plus, Search } from "lucide-react";

export default function PatientsPage() {
  const { clinic } = useClinic();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!clinic) return;
    supabase
      .from("patients")
      .select("*")
      .eq("clinic_id", clinic.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setPatients(data ?? []);
        setLoading(false);
      });
  }, [clinic, supabase]);

  const filtered = patients.filter(
    (p) =>
      p.full_name.includes(search) ||
      p.file_number.includes(search) ||
      (p.phone?.includes(search) ?? false)
  );

  return (
    <div>
      <PageHeader
        title="المرضى"
        description={`${patients.length} مريض مسجل`}
        action={
          <Link href="/patients/new">
            <Button><Plus size={16} className="ml-2 inline" />مريض جديد</Button>
          </Link>
        }
      />

      <Card>
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="بحث بالاسم أو رقم الملف أو الهاتف..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400">جاري التحميل...</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="لا يوجد مرضى"
            description="ابدأ بإضافة أول مريض لعيادتك"
            action={<Link href="/patients/new"><Button>إضافة مريض</Button></Link>}
          />
        ) : (
          <div className="table-shell">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-4 py-3 text-right font-medium text-slate-600">رقم الملف</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">الاسم</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">الهاتف</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">الجنس</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3"><Badge>{p.file_number}</Badge></td>
                    <td className="px-4 py-3 font-medium">{p.full_name}</td>
                    <td className="px-4 py-3" dir="ltr">{p.phone ?? "—"}</td>
                    <td className="px-4 py-3">{p.gender === "male" ? "ذكر" : p.gender === "female" ? "أنثى" : "—"}</td>
                    <td className="px-4 py-3">
                      <Link href={`/patients/${p.id}`} className="text-cyan-600 hover:underline">عرض</Link>
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
