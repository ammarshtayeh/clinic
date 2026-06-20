"use client";

import { useState } from "react";
import { TOOTH_CONDITION_LABELS, TOOTH_CONDITION_COLORS, type ToothRecord, type ToothCondition } from "@/lib/types/database";
import { toast } from "@/lib/toast-store";

interface DentalChartProps {
  teeth: number[][];
  records: ToothRecord[];
  onToothClick: (toothNumber: number, condition: ToothCondition) => void;
}

const CONDITIONS: ToothCondition[] = [
  "healthy", "cavity", "filling", "crown", "root_canal", "extraction", "implant", "missing",
];

function ToothSVG({ number, condition, selected, onClick }: {
  number: number; condition: ToothCondition; selected: boolean; onClick: () => void;
}) {
  const color = TOOTH_CONDITION_COLORS[condition];
  const isUpper = number < 30;

  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center gap-1 transition hover:scale-110"
      title={`${number} — ${TOOTH_CONDITION_LABELS[condition]}`}
    >
      <svg width="36" height="48" viewBox="0 0 36 48" className={selected ? "drop-shadow-lg" : ""}>
        <path
          d={isUpper
            ? "M8,40 Q8,8 18,4 Q28,8 28,40 Q24,44 18,46 Q12,44 8,40 Z"
            : "M8,8 Q8,40 18,44 Q28,40 28,8 Q24,4 18,2 Q12,4 8,8 Z"}
          fill={`${color}30`}
          stroke={selected ? "#06b6d4" : color}
          strokeWidth={selected ? 2.5 : 1.5}
          className="transition group-hover:stroke-cyan-500"
        />
        {condition !== "healthy" && condition !== "missing" && (
          <circle cx="18" cy={isUpper ? 28 : 20} r="4" fill={color} opacity="0.7" />
        )}
        {condition === "missing" && (
          <line x1="10" y1="24" x2="26" y2="24" stroke={color} strokeWidth="2" />
        )}
      </svg>
      <span className="text-[10px] font-bold text-slate-500">{number}</span>
    </button>
  );
}

export function DentalChart({ teeth, records, onToothClick }: DentalChartProps) {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);

  const getCondition = (num: number): ToothCondition =>
    records.find((r) => r.tooth_number === num)?.condition ?? "healthy";

  const handleSelect = (condition: ToothCondition) => {
    if (selectedTooth === null) return;
    onToothClick(selectedTooth, condition);
    toast.success(`تم تحديث السن ${selectedTooth}`);
    setSelectedTooth(null);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-3 rounded-2xl bg-slate-50 p-4">
        {CONDITIONS.map((c) => (
          <div key={c} className="flex items-center gap-1.5 text-xs font-medium">
            <span className="h-3 w-3 rounded-full" style={{ background: TOOTH_CONDITION_COLORS[c] }} />
            {TOOTH_CONDITION_LABELS[c]}
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[600px] space-y-6 rounded-3xl border border-slate-100 bg-white p-6">
          {teeth.slice(0, 2).map((row, ri) => (
            <div key={ri} className="flex justify-center gap-1">
              {row.map((num) => (
                <ToothSVG key={num} number={num} condition={getCondition(num)}
                  selected={selectedTooth === num} onClick={() => setSelectedTooth(selectedTooth === num ? null : num)} />
              ))}
            </div>
          ))}
          <div className="mx-auto h-px w-3/4 bg-gradient-to-l from-transparent via-slate-200 to-transparent" />
          {teeth.slice(2).map((row, ri) => (
            <div key={ri} className="flex justify-center gap-1">
              {row.map((num) => (
                <ToothSVG key={num} number={num} condition={getCondition(num)}
                  selected={selectedTooth === num} onClick={() => setSelectedTooth(selectedTooth === num ? null : num)} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {selectedTooth !== null && (
        <div className="mt-6 animate-slide-up rounded-2xl border-2 border-cyan-200 bg-cyan-50/50 p-5">
          <p className="mb-4 text-sm font-black text-slate-800">تحديث السن {selectedTooth}:</p>
          <div className="flex flex-wrap gap-2">
            {CONDITIONS.map((c) => (
              <button key={c} onClick={() => handleSelect(c)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md transition hover:scale-105"
                style={{ background: TOOTH_CONDITION_COLORS[c] }}>
                {TOOTH_CONDITION_LABELS[c]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
