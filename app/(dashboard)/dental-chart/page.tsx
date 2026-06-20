"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useClinic } from "@/lib/hooks/use-clinic";
import { PageHeader, Card } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { DentalChart, type ToothUpdatePayload } from "@/components/dental/dental-chart";
import { Button } from "@/components/ui/button";
import type { Patient, ToothRecord, Treatment } from "@/lib/types/database";
import { ExternalLink, Smile, User } from "lucide-react";

function DentalChartPageContent() {
  const { clinic, loading: clinicLoading } = useClinic();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState(searchParams.get("patient") ?? "");
  const [records, setRecords] = useState<ToothRecord[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(false);

  const selectedPatientData = useMemo(
    () => patients.find((p) => p.id === selectedPatient),
    [patients, selectedPatient]
  );

  useEffect(() => {
    if (clinicLoading || !clinic) return;
    supabase
      .from("patients")
      .select("id, full_name, file_number, phone, date_of_birth, gender")
      .eq("clinic_id", clinic.id)
      .eq("is_active", true)
      .order("full_name")
      .then(({ data }) => setPatients((data ?? []) as Patient[]));
  }, [clinic, clinicLoading, supabase]);

  useEffect(() => {
    if (!selectedPatient || !clinic) {
      setRecords([]);
      setTreatments([]);
      return;
    }
    setLoading(true);
    Promise.all([
      supabase.from("tooth_records").select("*").eq("patient_id", selectedPatient).eq("clinic_id", clinic.id),
      supabase.from("treatments").select("*, procedure:procedures(name_ar)").eq("patient_id", selectedPatient).eq("clinic_id", clinic.id),
    ]).then(([recordsRes, treatmentsRes]) => {
      setRecords(recordsRes.data ?? []);
      setTreatments((treatmentsRes.data ?? []) as Treatment[]);
      setLoading(false);
    });
  }, [selectedPatient, clinic, supabase]);

  const reloadRecords = async () => {
    if (!selectedPatient || !clinic) return;
    const { data } = await supabase
      .from("tooth_records")
      .select("*")
      .eq("patient_id", selectedPatient)
      .eq("clinic_id", clinic.id);
    setRecords(data ?? []);
  };

  const handleUpdate = async ({ toothNumber, condition, surfaces, notes }: ToothUpdatePayload) => {
    if (!clinic || !selectedPatient) return;
    const existing = records.find((r) => r.tooth_number === toothNumber);
    const payload = { condition, surfaces, notes };

    if (existing) {
      await supabase.from("tooth_records").update(payload).eq("id", existing.id);
    } else {
      await supabase.from("tooth_records").insert({
        clinic_id: clinic.id,
        patient_id: selectedPatient,
        tooth_number: toothNumber,
        ...payload,
      });
    }
    await reloadRecords();
  };

  return (
    <div>
      <PageHeader
        title="المخطط السني"
        description="odontogram احترافي بنظام FDI — تسجيل سريع وتفاصيل سريرية دقيقة"
        badge={
          <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-black text-cyan-700">
            FDI · ISO 3950
          </span>
        }
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
        <Card className="!p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Select
                label="اختر المريض"
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                options={[
                  { value: "", label: "اختر مريضاً..." },
                  ...patients.map((p) => ({ value: p.id, label: `${p.full_name} — #${p.file_number}` })),
                ]}
              />
            </div>
            {selectedPatientData && (
              <Link href={`/patients/${selectedPatientData.id}`}>
                <Button variant="ghost" size="sm">
                  <ExternalLink size={14} className="ml-1 inline" />
                  ملف المريض
                </Button>
              </Link>
            )}
          </div>
        </Card>

        {selectedPatientData && (
          <Card className="!p-4 lg:min-w-[260px]" dark>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-300">
                <User size={22} />
              </div>
              <div>
                <p className="font-black text-white">{selectedPatientData.full_name}</p>
                <p className="text-xs text-slate-400">#{selectedPatientData.file_number}</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {!selectedPatient ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-100 to-cyan-50 shadow-inner">
              <Smile size={44} className="text-cyan-600" />
            </div>
            <h3 className="text-xl font-black text-slate-800">ابدأ الفحص السني</h3>
            <p className="mt-2 max-w-md text-sm text-slate-500">
              اختر مريضاً من القائمة أعلاه لعرض مخططه السني التفاعلي — يمكنك التسجيل السريع أو تعديل
              الأسطح والملاحظات لكل سن
            </p>
          </div>
        </Card>
      ) : loading ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-24">
            <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600" />
            <p className="text-sm font-medium text-slate-500">جاري تحميل المخطط...</p>
          </div>
        </Card>
      ) : (
        <DentalChart
          records={records}
          onUpdate={handleUpdate}
          treatments={treatments.map((t) => ({
            id: t.id,
            tooth_number: t.tooth_number,
            status: t.status,
            cost: t.cost,
            procedure: t.procedure ?? null,
          }))}
        />
      )}
    </div>
  );
}

export default function DentalChartPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600" />
      </div>
    }>
      <DentalChartPageContent />
    </Suspense>
  );
}
