"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import {
  Activity, CircleDot, Crown, Drill, Heart, Minus, PenLine,
  Sparkles, Stethoscope, X,
} from "lucide-react";
import {
  ALL_TEETH, CONDITIONS, LOWER_LEFT, LOWER_RIGHT, QUADRANT_LABELS,
  SURFACE_LABELS, TOOTH_NAMES_AR, UPPER_LEFT, UPPER_RIGHT,
  getArchRotation, getQuadrant, getToothType, isUpperJaw,
  parseSurfaces, serializeSurfaces, type SurfaceCode,
} from "@/lib/dental/fdi";
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

function getToothPaths(type: ReturnType<typeof getToothType>, upper: boolean) {
  switch (type) {
    case "incisor":
      return {
        crown: upper
          ? "M12,38 Q12,10 20,6 Q28,10 28,38 Q26,42 20,44 Q14,42 12,38 Z"
          : "M12,10 Q12,38 20,42 Q28,38 28,10 Q26,6 20,4 Q14,6 12,10 Z",
        root: upper
          ? "M17,38 L17,52 M23,38 L23,52"
          : "M17,10 L17,-4 M23,10 L23,-4",
        rootY: upper ? 52 : -4,
      };
    case "canine":
      return {
        crown: upper
          ? "M14,38 Q14,12 20,4 Q26,12 26,38 Q24,42 20,44 Q16,42 14,38 Z"
          : "M14,10 Q14,36 20,44 Q26,36 26,10 Q24,6 20,4 Q16,6 14,10 Z",
        root: upper ? "M20,38 L20,54" : "M20,10 L20,-6",
        rootY: upper ? 54 : -6,
      };
    case "premolar":
      return {
        crown: upper
          ? "M10,38 Q10,14 16,10 Q20,8 24,10 Q30,14 30,38 Q28,42 20,44 Q12,42 10,38 Z"
          : "M10,10 Q10,34 16,38 Q20,40 24,38 Q30,34 30,10 Q28,6 20,4 Q12,6 10,10 Z",
        root: upper ? "M17,38 L16,50 M23,38 L24,50" : "M17,10 L16,-2 M23,10 L24,-2",
        rootY: upper ? 50 : -2,
      };
    default:
      return {
        crown: upper
          ? "M8,38 Q8,12 14,8 Q20,6 26,8 Q32,12 32,38 Q30,44 20,46 Q10,44 8,38 Z"
          : "M8,10 Q8,36 14,40 Q20,42 26,40 Q32,36 32,10 Q30,4 20,2 Q10,4 8,10 Z",
        root: upper
          ? "M15,38 L14,50 M20,38 L20,52 M25,38 L26,50"
          : "M15,10 L14,-2 M20,10 L20,-6 M25,10 L26,-2",
        rootY: upper ? 52 : -6,
      };
  }
}

function ToothIcon({
  number, condition, selected, activeCondition, onClick,
}: {
  number: number;
  condition: ToothCondition;
  selected: boolean;
  activeCondition: ToothCondition | null;
  onClick: () => void;
}) {
  const upper = isUpperJaw(number);
  const type = getToothType(number);
  const { crown, root } = getToothPaths(type, upper);
  const color = TOOTH_CONDITION_COLORS[condition];
  const rotation = getArchRotation(number);
  const isMissing = condition === "missing";
  const isImplant = condition === "implant";

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "group relative flex flex-col items-center transition-all duration-200",
        selected ? "z-10 scale-110" : "hover:scale-105",
        activeCondition && !selected && "hover:ring-2 hover:ring-cyan-300/60 rounded-xl"
      )}
      title={`${number} — ${TOOTH_NAMES_AR[number] ?? "سن"} — ${TOOTH_CONDITION_LABELS[condition]}`}
    >
      <div
        className={clsx(
          "relative rounded-xl p-0.5",
          selected && "bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-lg shadow-cyan-500/30",
          !selected && condition !== "healthy" && "ring-1 ring-offset-1 ring-[var(--tooth-ring)]",
        )}
        style={!selected && condition !== "healthy" ? { "--tooth-ring": `${color}88` } as React.CSSProperties : undefined}
      >
        <svg
          width="44"
          height="58"
          viewBox="0 0 40 56"
          className="drop-shadow-sm"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <defs>
            <linearGradient id={`enamel-${number}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f1f5f9" />
            </linearGradient>
            <linearGradient id={`cond-${number}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={`${color}cc`} />
              <stop offset="100%" stopColor={`${color}66`} />
            </linearGradient>
          </defs>

          {!isMissing && (
            <>
              <path d={root} fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
              {condition === "root_canal" && (
                <path d={root} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.9" />
              )}
              {isImplant && (
                <>
                  <rect x="18" y={upper ? 38 : 6} width="4" height={upper ? 14 : 14} rx="1" fill="#94a3b8" />
                  {[0, 1, 2].map((i) => (
                    <line
                      key={i}
                      x1="14" x2="26"
                      y1={(upper ? 42 : 10) + i * 4}
                      y2={(upper ? 42 : 10) + i * 4}
                      stroke="#64748b" strokeWidth="1"
                    />
                  ))}
                </>
              )}
            </>
          )}

          <path
            d={crown}
            fill={isMissing ? "none" : condition === "healthy" ? `url(#enamel-${number})` : `url(#cond-${number})`}
            stroke={selected ? "#06b6d4" : isMissing ? "#94a3b8" : color}
            strokeWidth={selected ? 2.5 : isMissing ? 1.5 : 1.8}
            strokeDasharray={isMissing ? "4 3" : undefined}
          />

          {condition === "crown" && !isMissing && (
            <path
              d={upper ? "M10,22 Q20,16 30,22 L28,32 Q20,28 12,32 Z" : "M10,34 Q20,40 30,34 L28,24 Q20,28 12,24 Z"}
              fill={`${color}88`} stroke={color} strokeWidth="1"
            />
          )}

          {condition === "filling" && !isMissing && (
            <ellipse cx="20" cy={upper ? 24 : 32} rx="5" ry="4" fill={color} opacity="0.75" />
          )}

          {condition === "cavity" && !isMissing && (
            <circle cx="20" cy={upper ? 26 : 30} r="4" fill={color} opacity="0.85" />
          )}

          {isMissing && (
            <>
              <line x1="12" y1="28" x2="28" y2="28" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="28" y1="28" x2="12" y2="28" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round"
                transform="rotate(90 20 28)" />
            </>
          )}
        </svg>
      </div>

      <span className={clsx(
        "mt-1 rounded-md px-1.5 py-0.5 text-[10px] font-black tabular-nums",
        selected ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-600 group-hover:bg-cyan-50 group-hover:text-cyan-700"
      )}>
        {number}
      </span>
    </button>
  );
}

function ArchRow({
  teeth, records, selectedTooth, activeCondition, onToothClick, mirror, filter,
}: {
  teeth: number[];
  records: ToothRecord[];
  selectedTooth: number | null;
  activeCondition: ToothCondition | null;
  onToothClick: (n: number) => void;
  mirror?: boolean;
  filter: ToothCondition | "all";
}) {
  const getCondition = (num: number) =>
    records.find((r) => r.tooth_number === num)?.condition ?? "healthy";

  return (
    <div className={clsx("flex items-end justify-center gap-0.5 sm:gap-1", mirror && "flex-row-reverse")}>
      {teeth.map((num) => {
        const condition = getCondition(num);
        const dimmed = filter !== "all" && condition !== filter;
        return (
          <div key={num} className={clsx("transition-opacity", dimmed && "opacity-20")}>
            <ToothIcon
              number={num}
              condition={condition}
              selected={selectedTooth === num}
              activeCondition={activeCondition}
              onClick={() => onToothClick(num)}
            />
          </div>
        );
      })}
    </div>
  );
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
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-8 shadow-2xl">
          <div className="pointer-events-none absolute inset-0 opacity-30">
            <svg className="h-full w-full" viewBox="0 0 800 400" preserveAspectRatio="none">
              <ellipse cx="400" cy="115" rx="340" ry="70" fill="none" stroke="#06b6d4" strokeWidth="1" strokeDasharray="6 4" />
              <ellipse cx="400" cy="285" rx="300" ry="60" fill="none" stroke="#06b6d4" strokeWidth="1" strokeDasharray="6 4" />
              <line x1="400" y1="40" x2="400" y2="360" stroke="#ffffff" strokeWidth="1" strokeDasharray="4 6" opacity="0.2" />
            </svg>
          </div>

          <p className="relative mb-4 text-center text-xs font-bold tracking-widest text-cyan-400/80">
            الفك العلوي · MAXILLA
          </p>

          <div className="relative space-y-1">
            <div className="mb-2 flex justify-between px-2 text-[10px] font-bold text-slate-500">
              <span>{QUADRANT_LABELS[1].en}</span>
              <span>{QUADRANT_LABELS[2].en}</span>
            </div>
            <div className="flex justify-center gap-4 sm:gap-8">
              <ArchRow teeth={UPPER_RIGHT} records={records} filter={filter}
                selectedTooth={selectedTooth} activeCondition={activeCondition}
                onToothClick={handleToothClick} />
              <div className="hidden w-px bg-gradient-to-b from-transparent via-cyan-500/40 to-transparent sm:block" />
              <ArchRow teeth={UPPER_LEFT} records={records} filter={filter}
                selectedTooth={selectedTooth} activeCondition={activeCondition}
                onToothClick={handleToothClick} mirror />
            </div>
          </div>

          <div className="my-6 flex items-center gap-3 px-4">
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-cyan-500/50 to-transparent" />
            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-black text-cyan-300">
              خط المنتصف · MIDLINE
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          </div>

          <div className="relative space-y-1">
            <div className="flex justify-center gap-4 sm:gap-8">
              <ArchRow teeth={LOWER_RIGHT} records={records} filter={filter}
                selectedTooth={selectedTooth} activeCondition={activeCondition}
                onToothClick={handleToothClick} />
              <div className="hidden w-px bg-gradient-to-b from-transparent via-cyan-500/40 to-transparent sm:block" />
              <ArchRow teeth={LOWER_LEFT} records={records} filter={filter}
                selectedTooth={selectedTooth} activeCondition={activeCondition}
                onToothClick={handleToothClick} mirror />
            </div>
            <div className="mt-2 flex justify-between px-2 text-[10px] font-bold text-slate-500">
              <span>{QUADRANT_LABELS[4].en}</span>
              <span>{QUADRANT_LABELS[3].en}</span>
            </div>
          </div>

          <p className="relative mt-4 text-center text-xs font-bold tracking-widest text-cyan-400/80">
            الفك السفلي · MANDIBLE
          </p>

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
