"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import {
  Activity, CircleDot, Crown, Drill, Heart, Minus, PenLine,
  Sparkles, Stethoscope, X,
} from "lucide-react";
import {
  ALL_TEETH, CONDITIONS, QUADRANT_LABELS,
  SURFACE_LABELS, TOOTH_NAMES_AR,
  getQuadrant,
  parseSurfaces, serializeSurfaces, type SurfaceCode,
} from "@/lib/dental/fdi";
import { OdontogramCanvas } from "@/components/dental/odontogram-canvas";
import {
  TOOTH_CONDITION_COLORS, TOOTH_CONDITION_LABELS,
  type ToothCondition, type ToothRecord,
} from "@/lib/types/database";
import { Textarea } from "@/components/ui/input";
import { toast } from "@/lib/toast-store";

const CONDITION_ICONS: Partial<Record<ToothCondition, React.ReactNode>> = {
  healthy: <Heart size={14} />,
  cavity: <CircleDot size={14} />,
  filling: <Sparkles size={14} />,
  crown: <Crown size={14} />,
  root_canal: <Drill size={14} />,
  extraction: <Minus size={14} />,
  implant: <Stethoscope size={14} />,
  missing: <X size={14} />,
  other: <PenLine size={14} />,
};

export interface ToothUpdatePayload {
  toothNumber: number;
  condition: ToothCondition;
  surfaces: string | null;
  notes: string | null;
}

interface DentalChartProps {
  records: ToothRecord[];
  onUpdate: (payload: ToothUpdatePayload) => Promise<void>;
  treatments?: Array<{
    id: string;
    tooth_number: number | null;
    status: string;
    cost: number;
    procedure?: { name_ar: string } | null;
  }>;
}

function SurfacePicker({
  selected, onChange, condition,
}: {
  selected: SurfaceCode[];
  onChange: (s: SurfaceCode[]) => void;
  condition: ToothCondition;
}) {
  if (condition === "healthy" || condition === "missing") return null;

  const toggle = (code: SurfaceCode) => {
    onChange(selected.includes(code) ? selected.filter((s) => s !== code) : [...selected, code]);
  };

  const btn = (code: SurfaceCode, className: string) => (
    <button
      type="button"
      key={code}
      onClick={() => toggle(code)}
      className={clsx(
        "rounded-lg border px-2 py-1.5 text-xs font-bold transition",
        selected.includes(code)
          ? "border-cyan-500 bg-cyan-500 text-white shadow-md"
          : "border-slate-200 bg-white text-slate-600 hover:border-cyan-300",
        className
      )}
    >
      {code} · {SURFACE_LABELS[code]}
    </button>
  );

  return (
    <div className="mt-4">
      <p className="mb-2 text-xs font-bold text-slate-500">أسطح السن المتأثرة</p>
      <div className="grid grid-cols-3 gap-1.5 max-w-[200px] mx-auto">
        <div />
        {btn("B", "col-start-2")}
        <div />
        {btn("M", "justify-self-end")}
        {btn("O", "justify-self-center")}
        {btn("D", "justify-self-start")}
        <div />
        {btn("L", "col-start-2")}
        <div />
      </div>
    </div>
  );
}

function ChartStats({ records }: { records: ToothRecord[] }) {
  const stats = useMemo(() => {
    const map = new Map(records.map((r) => [r.tooth_number, r.condition]));
    let healthy = 0, issues = 0, missing = 0, charted = records.length;
    for (const n of ALL_TEETH) {
      const c = map.get(n) ?? "healthy";
      if (c === "healthy") healthy++;
      else if (c === "missing") missing++;
      else issues++;
    }
    return { healthy, issues, missing, charted };
  }, [records]);

  const items = [
    { label: "سليم", value: stats.healthy, color: "#22c55e" },
    { label: "يحتاج علاج", value: stats.issues, color: "#f97316" },
    { label: "مفقود", value: stats.missing, color: "#94a3b8" },
    { label: "مسجّل", value: stats.charted, color: "#06b6d4" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map((s) => (
        <div key={s.label} className="rounded-2xl border border-slate-100 bg-white/80 p-3 text-center backdrop-blur-sm">
          <p className="text-2xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
          <p className="text-[11px] font-semibold text-slate-500">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

export function DentalChart({ records, onUpdate, treatments = [] }: DentalChartProps) {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [activeCondition, setActiveCondition] = useState<ToothCondition | null>(null);
  const [editCondition, setEditCondition] = useState<ToothCondition>("healthy");
  const [editSurfaces, setEditSurfaces] = useState<SurfaceCode[]>([]);
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<ToothCondition | "all">("all");

  const selectedRecord = selectedTooth
    ? records.find((r) => r.tooth_number === selectedTooth)
    : null;

  const toothTreatments = selectedTooth
    ? treatments.filter((t) => t.tooth_number === selectedTooth)
    : [];

  useEffect(() => {
    if (selectedTooth === null) return;
    const rec = records.find((r) => r.tooth_number === selectedTooth);
    setEditCondition(rec?.condition ?? "healthy");
    setEditSurfaces(parseSurfaces(rec?.surfaces ?? null));
    setEditNotes(rec?.notes ?? "");
  }, [selectedTooth, records]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedTooth(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleToothClick = useCallback(async (num: number) => {
    if (activeCondition && activeCondition !== "healthy") {
      setSaving(true);
      try {
        await onUpdate({
          toothNumber: num,
          condition: activeCondition,
          surfaces: null,
          notes: selectedRecord?.notes ?? null,
        });
        toast.success(`تم تسجيل ${TOOTH_CONDITION_LABELS[activeCondition]} على السن ${num}`);
        setSelectedTooth(num);
      } finally {
        setSaving(false);
      }
      return;
    }
    setSelectedTooth((prev) => (prev === num ? null : num));
  }, [activeCondition, onUpdate, selectedRecord?.notes]);

  const saveDetails = async () => {
    if (selectedTooth === null) return;
    setSaving(true);
    try {
      await onUpdate({
        toothNumber: selectedTooth,
        condition: editCondition,
        surfaces: editSurfaces.length ? serializeSurfaces(editSurfaces) : null,
        notes: editNotes.trim() || null,
      });
      toast.success(`تم حفظ السن ${selectedTooth}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <ChartStats records={records} />

      {/* Condition palette — paint mode */}
      <div className="rounded-3xl border border-slate-100 bg-gradient-to-l from-slate-50 to-white p-4 shadow-inner">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-cyan-600" />
            <p className="text-sm font-black text-slate-800">أداة التسجيل السريع</p>
            <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-bold text-cyan-700">
              اختر حالة ثم انقر على السن
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400">تصفية:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as ToothCondition | "all")}
              className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold"
            >
              <option value="all">الكل</option>
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>{TOOTH_CONDITION_LABELS[c]}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActiveCondition(activeCondition === c ? null : c)}
              className={clsx(
                "flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all",
                activeCondition === c
                  ? "scale-105 text-white shadow-lg"
                  : "bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-cyan-300"
              )}
              style={activeCondition === c ? { background: TOOTH_CONDITION_COLORS[c], boxShadow: `0 8px 20px -6px ${TOOTH_CONDITION_COLORS[c]}88` } : undefined}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-black/10">
                {CONDITION_ICON_NODE(c)}
              </span>
              {TOOTH_CONDITION_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        {/* Odontogram */}
        <div className="relative overflow-x-auto overflow-y-visible rounded-3xl border border-slate-200/80 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-2 py-6 sm:p-6 shadow-2xl min-h-[480px]">
          <OdontogramCanvas
            records={records}
            selectedTooth={selectedTooth}
            filter={filter}
            onToothClick={handleToothClick}
          />

          {saving && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-[1px]">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
            </div>
          )}
        </div>

        {/* Inspector panel */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-lg xl:sticky xl:top-6 xl:self-start">
          {selectedTooth === null ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-100 to-cyan-50 text-cyan-600">
                <Stethoscope size={28} />
              </div>
              <p className="font-black text-slate-800">فحص السن</p>
              <p className="mt-2 max-w-[220px] text-sm text-slate-500">
                انقر على أي سن لعرض التفاصيل، أو اختر حالة من الأعلى للتسجيل السريع
              </p>
            </div>
          ) : (
            <div className="animate-fade-in space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-3xl font-black text-slate-900" dir="ltr">{selectedTooth}</p>
                  <p className="text-sm font-bold text-slate-600">{TOOTH_NAMES_AR[selectedTooth]}</p>
                  <p className="text-xs text-slate-400">{QUADRANT_LABELS[getQuadrant(selectedTooth)].ar}</p>
                </div>
                <button type="button" onClick={() => setSelectedTooth(null)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100">
                  <X size={18} />
                </button>
              </div>

              <div>
                <p className="mb-2 text-xs font-bold text-slate-500">حالة السن</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {CONDITIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEditCondition(c)}
                      className={clsx(
                        "rounded-xl px-2 py-2 text-[10px] font-bold transition",
                        editCondition === c ? "text-white shadow-md" : "bg-slate-50 text-slate-600 ring-1 ring-slate-100"
                      )}
                      style={editCondition === c ? { background: TOOTH_CONDITION_COLORS[c] } : undefined}
                    >
                      {TOOTH_CONDITION_LABELS[c]}
                    </button>
                  ))}
                </div>
              </div>

              <SurfacePicker selected={editSurfaces} onChange={setEditSurfaces} condition={editCondition} />

              <Textarea
                label="ملاحظات سريرية"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="مثال: تسوس عميق، يحتاج أشعة..."
                rows={3}
              />

              {toothTreatments.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-bold text-slate-500">علاجات مرتبطة</p>
                  <div className="space-y-2">
                    {toothTreatments.map((t) => (
                      <div key={t.id} className="rounded-xl bg-slate-50 px-3 py-2 text-xs">
                        <p className="font-bold text-slate-700">{t.procedure?.name_ar ?? "علاج"}</p>
                        <p className="text-slate-400">{t.cost} ₪ · {t.status}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={saveDetails}
                disabled={saving}
                className="soft-button w-full py-3 disabled:opacity-50"
              >
                {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
        {CONDITIONS.map((c) => (
          <div key={c} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full ring-1 ring-black/5" style={{ background: TOOTH_CONDITION_COLORS[c] }} />
            {TOOTH_CONDITION_LABELS[c]}
          </div>
        ))}
        <span className="text-[10px] text-slate-400">· نظام FDI الدولي</span>
      </div>
    </div>
  );
}

function CONDITION_ICON_NODE(c: ToothCondition) {
  return CONDITION_ICONS[c] ?? <CircleDot size={14} />;
}
