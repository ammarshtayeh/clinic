"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useClinic } from "@/lib/hooks/use-clinic";
import { PageHeader, Card, EmptyState } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/ui/dialog";
import { toast } from "@/lib/toast-store";
import type { Patient, Prescription, PrescriptionItem } from "@/lib/types/database";
import { Pill, Plus, X, Trash2, Printer, User } from "lucide-react";
import { format } from "date-fns";

export default function PrescriptionsPage() {
  const { clinic, profile } = useClinic();
  const [rows, setRows] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const supabase = createClient();

  const load = () => {
    if (!clinic) return;
    Promise.all([
      supabase.from("prescriptions").select("*, patient:patients(full_name, file_number)")
        .eq("clinic_id", clinic.id).order("issued_at", { ascending: false }),
      supabase.from("patients").select("*").eq("clinic_id", clinic.id).eq("is_active", true),
    ]).then(([rx, pts]) => {
      setRows((rx.data ?? []) as Prescription[]);
      setPatients((pts.data ?? []) as Patient[]);
      setLoading(false);
    });
  };

  useEffect(load, [clinic, supabase]);

  return (
    <div>
      <PageHeader
        title="الوصفات الطبية"
        description="إصدار وأرشفة الوصفات الدوائية للمرضى"
        action={<Button size="sm" onClick={() => setCreating(true)}><Plus size={16} /> وصفة جديدة</Button>}
      />

      <Card>
        {loading ? <TableSkeleton /> : rows.length === 0 ? (
          <EmptyState
            icon={<Pill size={48} />}
            title="لا توجد وصفات بعد"
            description="ابدأ بإصدار أول وصفة طبية لمريض"
            action={<Button onClick={() => setCreating(true)}><Plus size={16} /> وصفة جديدة</Button>}
          />
        ) : (
          <div className="space-y-3">
            {rows.map((rx) => (
              <PrescriptionRow key={rx.id} rx={rx} doctorName={profile?.full_name} clinicName={clinic?.name} />
            ))}
          </div>
        )}
      </Card>

      {creating && (
        <CreatePrescription
          patients={patients}
          clinicId={clinic?.id ?? ""}
          doctorId={profile?.id ?? null}
          onClose={() => setCreating(false)}
          onCreated={() => { setCreating(false); load(); }}
        />
      )}
    </div>
  );
}

function PrescriptionRow({ rx, doctorName, clinicName }: { rx: Prescription; doctorName?: string; clinicName?: string }) {
  const [open, setOpen] = useState(false);
  const print = () => {
    const win = window.open("", "_blank", "width=720,height=900");
    if (!win) return;
    win.document.write(`<html dir="rtl"><head><title>وصفة طبية</title>
      <style>body{font-family:Tahoma,sans-serif;padding:40px;color:#0f172a}h1{color:#0891b2}
      table{width:100%;border-collapse:collapse;margin-top:16px}th,td{border:1px solid #cbd5e1;padding:10px;text-align:right}
      th{background:#f1f5f9}.head{display:flex;justify-content:space-between;border-bottom:3px solid #0891b2;padding-bottom:12px}</style></head><body>
      <div class="head"><div><h1>${clinicName ?? "العيادة"}</h1><p>وصفة طبية</p></div>
      <div style="text-align:left"><p>الطبيب: ${doctorName ?? "—"}</p><p>التاريخ: ${format(new Date(rx.issued_at), "yyyy-MM-dd")}</p></div></div>
      <p><b>المريض:</b> ${rx.patient?.full_name ?? "—"}</p>
      <p><b>التشخيص:</b> ${rx.diagnosis ?? "—"}</p>
      <table><thead><tr><th>الدواء</th><th>الجرعة</th><th>التكرار</th><th>المدة</th></tr></thead><tbody>
      ${rx.items.map((i) => `<tr><td>${i.drug}</td><td>${i.dose}</td><td>${i.frequency}</td><td>${i.duration}</td></tr>`).join("")}
      </tbody></table>${rx.notes ? `<p style="margin-top:16px"><b>ملاحظات:</b> ${rx.notes}</p>` : ""}
      </body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 transition hover:border-cyan-200">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-3 text-right">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600"><Pill size={18} /></span>
          <span>
            <span className="block font-bold text-slate-800">{rx.patient?.full_name ?? "—"}</span>
            <span className="block text-xs text-slate-500">{rx.diagnosis ?? "بدون تشخيص"} · {rx.items.length} دواء · {format(new Date(rx.issued_at), "yyyy-MM-dd")}</span>
          </span>
        </button>
        <button onClick={print} className="ghost-button !py-2"><Printer size={15} /> طباعة</button>
      </div>
      {open && (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 text-right text-xs text-slate-500">
              <th className="px-3 py-2">الدواء</th><th className="px-3 py-2">الجرعة</th><th className="px-3 py-2">التكرار</th><th className="px-3 py-2">المدة</th>
            </tr></thead>
            <tbody>
              {rx.items.map((it, i) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-semibold text-slate-700">{it.drug}</td>
                  <td className="px-3 py-2 text-slate-500">{it.dose}</td>
                  <td className="px-3 py-2 text-slate-500">{it.frequency}</td>
                  <td className="px-3 py-2 text-slate-500">{it.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rx.notes && <p className="border-t border-slate-100 px-3 py-2 text-xs text-slate-500">ملاحظات: {rx.notes}</p>}
        </div>
      )}
    </div>
  );
}

const EMPTY_ITEM: PrescriptionItem = { drug: "", dose: "", frequency: "", duration: "" };

function CreatePrescription({
  patients, clinicId, doctorId, onClose, onCreated,
}: {
  patients: Patient[];
  clinicId: string;
  doctorId: string | null;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [patientId, setPatientId] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<PrescriptionItem[]>([{ ...EMPTY_ITEM }]);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const setItem = (idx: number, key: keyof PrescriptionItem, val: string) =>
    setItems((arr) => arr.map((it, i) => (i === idx ? { ...it, [key]: val } : it)));

  const submit = async () => {
    if (!patientId) { toast.error("اختر المريض"); return; }
    const valid = items.filter((i) => i.drug.trim());
    if (valid.length === 0) { toast.error("أضف دواء واحد على الأقل"); return; }
    setSaving(true);
    await supabase.from("prescriptions").insert({
      clinic_id: clinicId, patient_id: patientId, doctor_id: doctorId,
      diagnosis: diagnosis.trim() || null, notes: notes.trim() || null,
      items: valid, issued_at: new Date().toISOString(),
    });
    toast.success("تم إصدار الوصفة");
    setSaving(false);
    onCreated();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/20 bg-white p-6 shadow-2xl">
        <button onClick={onClose} className="absolute left-4 top-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>
        <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-slate-900"><Pill size={20} className="text-cyan-600" /> وصفة طبية جديدة</h3>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 flex items-center gap-1 text-xs font-bold text-slate-600"><User size={13} /> المريض</span>
            <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className="w-full px-3 py-2.5 text-sm">
              <option value="">— اختر —</option>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.full_name} ({p.file_number})</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-slate-600">التشخيص</span>
            <input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} className="w-full px-3 py-2.5 text-sm" placeholder="مثال: التهاب لثة" />
          </label>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-700">الأدوية</span>
            <button onClick={() => setItems((a) => [...a, { ...EMPTY_ITEM }])} className="text-xs font-bold text-cyan-600 hover:underline">+ إضافة دواء</button>
          </div>
          <div className="space-y-2">
            {items.map((it, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2">
                <input value={it.drug} onChange={(e) => setItem(idx, "drug", e.target.value)} placeholder="الدواء" className="col-span-4 px-2.5 py-2 text-sm" />
                <input value={it.dose} onChange={(e) => setItem(idx, "dose", e.target.value)} placeholder="الجرعة" className="col-span-2 px-2.5 py-2 text-sm" />
                <input value={it.frequency} onChange={(e) => setItem(idx, "frequency", e.target.value)} placeholder="التكرار" className="col-span-3 px-2.5 py-2 text-sm" />
                <input value={it.duration} onChange={(e) => setItem(idx, "duration", e.target.value)} placeholder="المدة" className="col-span-2 px-2.5 py-2 text-sm" />
                <button onClick={() => setItems((a) => a.filter((_, i) => i !== idx))} className="col-span-1 flex items-center justify-center text-rose-400 hover:text-rose-600" disabled={items.length === 1}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <label className="mt-4 block">
          <span className="mb-1 block text-xs font-bold text-slate-600">ملاحظات</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-3 py-2.5 text-sm" placeholder="إرشادات إضافية للمريض" />
        </label>

        <div className="mt-6 flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1">إلغاء</Button>
          <Button onClick={submit} loading={saving} className="flex-1">إصدار الوصفة</Button>
        </div>
      </div>
    </div>
  );
}
