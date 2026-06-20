"use client";

import { useState } from "react";
import { TOOTH_CONDITION_LABELS, TOOTH_CONDITION_COLORS, type ToothRecord, type ToothCondition } from "@/lib/types/database";

interface DentalChartProps {
  teeth: number[][];
  records: ToothRecord[];
  onToothClick: (toothNumber: number, condition: ToothCondition) => void;
}

const CONDITIONS: ToothCondition[] = [
  "healthy", "cavity", "filling", "crown", "root_canal", "extraction", "implant", "missing",
];

export function DentalChart({ teeth, records, onToothClick }: DentalChartProps) {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);

  const getCondition = (num: number): ToothCondition => {
    const record = records.find((r) => r.tooth_number === num);
    return record?.condition ?? "healthy";
  };

  const handleSelect = (condition: ToothCondition) => {
    if (selectedTooth === null) return;
    onToothClick(selectedTooth, condition);
    setSelectedTooth(null);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-3">
        {CONDITIONS.map((c) => (
          <div key={c} className="flex items-center gap-1.5 text-xs">
            <span className="h-3 w-3 rounded-full" style={{ background: TOOTH_CONDITION_COLORS[c] }} />
            {TOOTH_CONDITION_LABELS[c]}
          </div>
        ))}
      </div>

      <div className="space-y-8">
        {teeth.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-2">
            {row.map((num) => {
              const condition = getCondition(num);
              const isSelected = selectedTooth === num;
              return (
                <button
                  key={num}
                  onClick={() => setSelectedTooth(isSelected ? null : num)}
                  className="flex h-12 w-12 flex-col items-center justify-center rounded-xl border-2 text-xs font-bold transition hover:scale-105"
                  style={{
                    background: `${TOOTH_CONDITION_COLORS[condition]}25`,
                    borderColor: isSelected ? "#0a91b6" : TOOTH_CONDITION_COLORS[condition],
                    color: TOOTH_CONDITION_COLORS[condition],
                  }}
                >
                  {num}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {selectedTooth !== null && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="mb-3 text-sm font-medium">تحديث حالة السن {selectedTooth}:</p>
          <div className="flex flex-wrap gap-2">
            {CONDITIONS.map((c) => (
              <button
                key={c}
                onClick={() => handleSelect(c)}
                className="rounded-xl px-3 py-1.5 text-xs font-medium text-white"
                style={{ background: TOOTH_CONDITION_COLORS[c] }}
              >
                {TOOTH_CONDITION_LABELS[c]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
