"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useClinic } from "@/lib/hooks/use-clinic";
import { PageHeader, Card, EmptyState } from "@/components/ui/card";
import { Badge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableSkeleton } from "@/components/ui/dialog";
import type { Patient } from "@/lib/types/database";
import { Plus, Search, Users } from "lucide-react";

export default function PatientsPage() {
  const { clinic } = useClinic();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!clinic) return;
    supabase.from("patients").select("*").eq("clinic_id", clinic.id).eq("is_active", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => { setPatients(data ?? []); setLoading(false); });
  }, [clinic, supabase]);

  const filtered = patients.filter((p) =>
    p.full_name.includes(search) || p.file_number.includes(search) || (p.phone?.includes(search) ?? false)
  );

  return (
    <div>
      <PageHeader title="المرضى" description={`${patients.length} مريض مسجل`}
        action={<Link href="/patients/new"><Button><Plus size={16} className="ml-2 inline" />مريض جديد</Button></Link>} />

      <Card>
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="بحث..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-10" />
          </div>
        </div>

        {loading ? <TableSkeleton /> : filtered.length === 0 ? (
          <EmptyState title="لا يوجد مرضى" icon={<Users size={48} />} action={<Link href="/patients/new"><Button>إضافة مريض</Button></Link>} />
        ) : (
          <>
            <div className="hidden md:block table-shell">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="px-4 py-3 text-right font-bold text-slate-600">الملف</th>
                    <th className="px-4 py-3 text-right font-bold text-slate-600">الاسم</th>
                    <th className="px-4 py-3 text-right font-bold text-slate-600">الهاتف</th>
                    <th className="px-4 py-3 text-right font-bold text-slate-600">الجنس</th>
                    <th className="px-4 py-3 text-right font-bold text-slate-600"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b border-slate-50 hover:bg-cyan-50/30 transition">
                      <td className="px-4 py-3"><Badge variant="cyan">{p.file_number}</Badge></td>
                      <td className="px-4 py-3 font-bold">{p.full_name}</td>
                      <td className="px-4 py-3" dir="ltr">{p.phone ?? "—"}</td>
                      <td className="px-4 py-3">{p.gender === "male" ? "ذكر" : p.gender === "female" ? "أنثى" : "—"}</td>
                      <td className="px-4 py-3"><Link href={`/patients/${p.id}`} className="font-bold text-cyan-600 hover:underline">عرض ←</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-3 md:hidden">
              {filtered.map((p) => (
                <Link key={p.id} href={`/patients/${p.id}`} className="block rounded-2xl border border-slate-100 p-4 transition hover:border-cyan-200 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">{p.full_name}</p>
                      <p className="text-xs text-slate-400">#{p.file_number}</p>
                    </div>
                    <span className="text-cyan-600">←</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
