"use client";

import {
  getToothType, QUADRANT_LABELS,
  UPPER_RIGHT, UPPER_LEFT, LOWER_RIGHT, LOWER_LEFT,
} from "@/lib/dental/fdi";
import {
  ARCH_PATHS, getToothPosition, ODONTOGRAM_VIEWBOX,
} from "@/lib/dental/arch-positions";
import { getToothCapsule } from "@/lib/dental/tooth-shapes";
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
    const cap = getToothCapsule(num, getToothType(num));
    const condition = getCondition(num);
    const dimmed = filter !== "all" && condition !== filter;

    return (
      <g
        key={num}
        transform={`translate(${pos.x - cap.width / 2}, ${pos.y - cap.height / 2}) rotate(${pos.rotate}, ${cap.width / 2}, ${cap.height / 2})`}
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
      className="mx-auto w-full max-w-[920px]"
      style={{ minHeight: 440 }}
      role="img"
      aria-label="مخطط الأسنان FDI"
    >
      {/* Arch guides */}
      <path d={ARCH_PATHS.upper} fill="none" stroke="#06b6d4" strokeWidth="1" strokeDasharray="6 4" opacity="0.22" />
      <path d={ARCH_PATHS.lower} fill="none" stroke="#06b6d4" strokeWidth="1" strokeDasharray="6 4" opacity="0.22" />

      {/* Midline */}
      <line x1="450" y1="72" x2="450" y2="428" stroke="#ffffff" strokeWidth="1" strokeDasharray="4 5" opacity="0.1" />

      {/* Jaw labels */}
      <text x="450" y="58" textAnchor="middle" fill="#67e8f9" fontSize="10" fontWeight="700" opacity="0.65" letterSpacing="1.5">
        MAXILLA · الفك العلوي
      </text>
      <text x="450" y="478" textAnchor="middle" fill="#67e8f9" fontSize="10" fontWeight="700" opacity="0.65" letterSpacing="1.5">
        MANDIBLE · الفك السفلي
      </text>

      {/* Quadrant labels */}
      <text x="118" y="128" fill="#475569" fontSize="8.5" fontWeight="700">{QUADRANT_LABELS[1].en}</text>
      <text x="782" y="128" textAnchor="end" fill="#475569" fontSize="8.5" fontWeight="700">{QUADRANT_LABELS[2].en}</text>
      <text x="118" y="378" fill="#475569" fontSize="8.5" fontWeight="700">{QUADRANT_LABELS[4].en}</text>
      <text x="782" y="378" textAnchor="end" fill="#475569" fontSize="8.5" fontWeight="700">{QUADRANT_LABELS[3].en}</text>

      {/* Midline badge */}
      <rect x="404" y="238" width="92" height="17" rx="8.5" fill="rgba(6,182,212,0.1)" stroke="rgba(6,182,212,0.28)" strokeWidth="0.5" />
      <text x="450" y="250" textAnchor="middle" fill="#a5f3fc" fontSize="7" fontWeight="800">
        MIDLINE · خط المنتصف
      </text>

      {renderQuadrant(UPPER_RIGHT, records, selectedTooth, filter, onToothClick)}
      {renderQuadrant(UPPER_LEFT, records, selectedTooth, filter, onToothClick)}
      {renderQuadrant(LOWER_RIGHT, records, selectedTooth, filter, onToothClick)}
      {renderQuadrant(LOWER_LEFT, records, selectedTooth, filter, onToothClick)}
    </svg>
  );
}
