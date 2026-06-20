"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useClinic } from "@/lib/hooks/use-clinic";
import { PageHeader, Card } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { DentalChart } from "@/components/dental/dental-chart";
import type { Patient, ToothRecord } from "@/lib/types/database";

const PERMANENT_TEETH = [
  [18, 17, 16, 15, 14, 13, 12, 11],
  [21, 22, 23, 24, 25, 26, 27, 28],
  [48, 47, 46, 45, 44, 43, 42, 41],
  [31, 32, 33, 34, 35, 36, 37, 38],
];

function DentalChartPageContent() {
  const { clinic } = useClinic();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState(searchParams.get("patient") ?? "");
  const [records, setRecords] = useState<ToothRecord[]>([]);

  useEffect(() => {
    if (!clinic) return;
    supabase.from("patients").select("id, full_name, file_number").eq("clinic_id", clinic.id).eq("is_active", true)
      .then(({ data }) => setPatients((data ?? []) as Patient[]));
  }, [clinic, supabase]);

  useEffect(() => {
    if (!selectedPatient || !clinic) return;
    supabase.from("tooth_records").select("*").eq("patient_id", selectedPatient).eq("clinic_id", clinic.id)
      .then(({ data }) => setRecords(data ?? []));
  }, [selectedPatient, clinic, supabase]);

  const handleToothUpdate = async (toothNumber: number, condition: string) => {
    if (!clinic || !selectedPatient) return;
    const existing = records.find((r) => r.tooth_number === toothNumber);
    if (existing) {
      await supabase.from("tooth_records").update({ condition }).eq("id", existing.id);
    } else {
      await supabase.from("tooth_records").insert({
        clinic_id: clinic.id,
        patient_id: selectedPatient,
        tooth_number: toothNumber,
        condition,
      });
    }
    const { data } = await supabase.from("tooth_records").select("*").eq("patient_id", selectedPatient);
    setRecords(data ?? []);
  };

  return (
    <div>
      <PageHeader title="المخطط السني" description="مخطط الأسنان بنظام FDI" />
      <Card>
        <div className="mb-6 max-w-md">
          <Select
            label="اختر المريض"
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            options={[
              { value: "", label: "اختر مريض..." },
              ...patients.map((p) => ({ value: p.id, label: `${p.full_name} (#${p.file_number})` })),
            ]}
          />
        </div>
        {selectedPatient ? (
          <DentalChart
            teeth={PERMANENT_TEETH}
            records={records}
            onToothClick={handleToothUpdate}
          />
        ) : (
          <p className="py-12 text-center text-slate-400">اختر مريضاً لعرض مخططه السني</p>
        )}
      </Card>
    </div>
  );
}

export default function DentalChartPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-slate-400">جاري التحميل...</div>}>
      <DentalChartPageContent />
    </Suspense>
  );
}
