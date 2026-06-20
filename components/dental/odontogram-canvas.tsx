"use client";

import {
  getToothType, isUpperJaw, QUADRANT_LABELS,
  UPPER_RIGHT, UPPER_LEFT, LOWER_RIGHT, LOWER_LEFT,
} from "@/lib/dental/fdi";
import {
  ARCH_PATHS, getToothPosition, ODONTOGRAM_VIEWBOX,
} from "@/lib/dental/arch-positions";
import { getToothShape } from "@/lib/dental/tooth-shapes";
import { ToothSVG } from "@/components/dental/tooth-svg";
import type { ToothCondition, ToothRecord } from "@/lib/types/database";

interface OdontogramCanvasProps {
  records: ToothRecord[];
  selectedTooth: number | null;
  filter: ToothCondition | "all";
  onToothClick: (n: number) => void;
}

function renderQuadrant(
  teeth: number[],
  records: ToothRecord[],
  selectedTooth: number | null,
  filter: ToothCondition | "all",
  onToothClick: (n: number) => void,
) {
  const getCondition = (num: number): ToothCondition =>
    records.find((r) => r.tooth_number === num)?.condition ?? "healthy";

  return teeth.map((num) => {
    const pos = getToothPosition(num);
    const shape = getToothShape(num, getToothType(num), isUpperJaw(num));
    const condition = getCondition(num);
    const dimmed = filter !== "all" && condition !== filter;

    return (
      <g
        key={num}
        transform={`translate(${pos.x - shape.width / 2}, ${pos.y - shape.height / 2}) rotate(${pos.rotate}, ${shape.width / 2}, ${shape.height / 2})`}
      >
        <ToothSVG
          number={num}
          condition={condition}
          selected={selectedTooth === num}
          dimmed={dimmed}
          onClick={() => onToothClick(num)}
        />
      </g>
    );
  });
}

export function OdontogramCanvas({ records, selectedTooth, filter, onToothClick }: OdontogramCanvasProps) {
  return (
    <svg
      viewBox={ODONTOGRAM_VIEWBOX}
      className="mx-auto w-full max-w-[900px]"
      style={{ minHeight: 420 }}
      role="img"
      aria-label="مخطط الأسنان FDI"
    >
      <defs>
        <radialGradient id="arch-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>
      </defs>

      {/* Arch guide curves */}
      <path d={ARCH_PATHS.upper} fill="none" stroke="#06b6d4" strokeWidth="1" strokeDasharray="5 4" opacity="0.25" />
      <path d={ARCH_PATHS.lower} fill="none" stroke="#06b6d4" strokeWidth="1" strokeDasharray="5 4" opacity="0.25" />

      {/* Midline */}
      <line x1="450" y1="60" x2="450" y2="460" stroke="#ffffff" strokeWidth="1" strokeDasharray="4 5" opacity="0.12" />

      {/* Jaw labels */}
      <text x="450" y="42" textAnchor="middle" fill="#67e8f9" fontSize="11" fontWeight="700" opacity="0.7" letterSpacing="2">
        MAXILLA · الفك العلوي
      </text>
      <text x="450" y="498" textAnchor="middle" fill="#67e8f9" fontSize="11" fontWeight="700" opacity="0.7" letterSpacing="2">
        MANDIBLE · الفك السفلي
      </text>

      {/* Quadrant labels */}
      <text x="130" y="130" fill="#64748b" fontSize="9" fontWeight="700">{QUADRANT_LABELS[1].en}</text>
      <text x="770" y="130" textAnchor="end" fill="#64748b" fontSize="9" fontWeight="700">{QUADRANT_LABELS[2].en}</text>
      <text x="130" y="410" fill="#64748b" fontSize="9" fontWeight="700">{QUADRANT_LABELS[4].en}</text>
      <text x="770" y="410" textAnchor="end" fill="#64748b" fontSize="9" fontWeight="700">{QUADRANT_LABELS[3].en}</text>

      {/* Midline badge */}
      <rect x="408" y="248" width="84" height="18" rx="9" fill="rgba(6,182,212,0.12)" stroke="rgba(6,182,212,0.3)" strokeWidth="0.5" />
      <text x="450" y="260" textAnchor="middle" fill="#a5f3fc" fontSize="7.5" fontWeight="800">
        MIDLINE · خط المنتصف
      </text>

      {/* All teeth */}
      {renderQuadrant(UPPER_RIGHT, records, selectedTooth, filter, onToothClick)}
      {renderQuadrant(UPPER_LEFT, records, selectedTooth, filter, onToothClick)}
      {renderQuadrant(LOWER_RIGHT, records, selectedTooth, filter, onToothClick)}
      {renderQuadrant(LOWER_LEFT, records, selectedTooth, filter, onToothClick)}
    </svg>
  );
}