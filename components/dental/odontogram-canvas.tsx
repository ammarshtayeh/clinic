"use client";

import clsx from "clsx";
import {
  LOWER_LEFT, LOWER_RIGHT, UPPER_LEFT, UPPER_RIGHT,
} from "@/lib/dental/fdi";
import {
  TOOTH_CONDITION_COLORS, TOOTH_CONDITION_LABELS,
  type ToothCondition, type ToothRecord,
} from "@/lib/types/database";

interface OdontogramCanvasProps {
  records: ToothRecord[];
  selectedTooth: number | null;
  filter: ToothCondition | "all";
  onToothClick: (n: number) => void;
}

/** Uniform shield silhouette — matches straight-row clinical chart style */
const TOOTH_PATH = "M20,3 L33,12 L35,28 L26,46 L14,46 L5,28 L7,12 Z";

function StraightTooth({
  number, condition, selected, dimmed, onClick,
}: {
  number: number;
  condition: ToothCondition;
  selected: boolean;
  dimmed?: boolean;
  onClick: () => void;
}) {
  const color = TOOTH_CONDITION_COLORS[condition];
  const isMissing = condition === "missing";
  const isHealthy = condition === "healthy";

  const fill = isMissing ? "none" : isHealthy ? "#f5f5f0" : color;

  return (
    <button
      type="button"
      onClick={onClick}
      title={`${number} — ${TOOTH_CONDITION_LABELS[condition]}`}
      className={clsx(
        "group flex flex-col items-center gap-1.5 transition-all",
        dimmed && "opacity-20",
        selected && "scale-110",
        !selected && "hover:scale-105",
      )}
    >
      <div className={clsx(
        "relative rounded-lg p-0.5",
        selected && "ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#0a1628]",
      )}>
        <svg width="38" height="50" viewBox="0 0 40 50" className="drop-shadow-sm">
          <path
            d={TOOTH_PATH}
            fill={fill}
            fillOpacity={isHealthy || isMissing ? 1 : 0.9}
            stroke={selected ? "#22d3ee" : isMissing ? "#64748b" : isHealthy ? "#d6d3c9" : color}
            strokeWidth={selected ? 2 : isMissing ? 1.5 : 1.2}
            strokeDasharray={isMissing ? "3 2" : undefined}
          />
          {isMissing && (
            <g stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" opacity="0.8">
              <line x1="13" y1="22" x2="27" y2="32" />
              <line x1="27" y1="22" x2="13" y2="32" />
            </g>
          )}
          {!isHealthy && !isMissing && (
            <circle cx="20" cy="8" r="2" fill={color} />
          )}
          {isHealthy && (
            <circle cx="20" cy="8" r="1.8" fill="#22c55e" opacity="0.9" />
          )}
        </svg>
      </div>
      <span className={clsx(
        "text-[11px] font-semibold tabular-nums",
        selected ? "text-cyan-300" : "text-slate-400",
      )}>
        {number}
      </span>
    </button>
  );
}

function ToothRow({
  rightTeeth, leftTeeth, records, selectedTooth, filter, onToothClick,
}: {
  rightTeeth: number[];
  leftTeeth: number[];
  records: ToothRecord[];
  selectedTooth: number | null;
  filter: ToothCondition | "all";
  onToothClick: (n: number) => void;
}) {
  const getCondition = (n: number) =>
    records.find((r) => r.tooth_number === n)?.condition ?? "healthy";

  const render = (teeth: number[]) =>
    teeth.map((num) => (
      <StraightTooth
        key={num}
        number={num}
        condition={getCondition(num)}
        selected={selectedTooth === num}
        dimmed={filter !== "all" && getCondition(num) !== filter}
        onClick={() => onToothClick(num)}
      />
    ));

  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center gap-0.5 sm:gap-1">{render(rightTeeth)}</div>
      <div className="mx-2 h-14 w-px shrink-0 border-r border-dashed border-slate-500/50 sm:mx-4" aria-hidden />
      <div className="flex items-center gap-0.5 sm:gap-1">{render(leftTeeth)}</div>
    </div>
  );
}

export function OdontogramCanvas({ records, selectedTooth, filter, onToothClick }: OdontogramCanvasProps) {
  return (
    <div className="relative mx-auto w-full max-w-[820px] rounded-2xl bg-[#0a1628] px-3 py-8 sm:px-6 sm:py-10">
      <span className="absolute left-4 top-4 rounded-full bg-cyan-950/60 px-3 py-1 text-[10px] font-bold text-cyan-400/90 ring-1 ring-cyan-800/40">
        صفوف مستقيمة
      </span>

      <div className="mt-6 space-y-10 sm:space-y-12">
        <ToothRow
          rightTeeth={UPPER_RIGHT}
          leftTeeth={UPPER_LEFT}
          records={records}
          selectedTooth={selectedTooth}
          filter={filter}
          onToothClick={onToothClick}
        />
        <ToothRow
          rightTeeth={LOWER_RIGHT}
          leftTeeth={LOWER_LEFT}
          records={records}
          selectedTooth={selectedTooth}
          filter={filter}
          onToothClick={onToothClick}
        />
      </div>
    </div>
  );
}
