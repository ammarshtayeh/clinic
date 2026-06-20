"use client";

import clsx from "clsx";
import { getToothType, isUpperJaw, TOOTH_NAMES_AR } from "@/lib/dental/fdi";
import { getToothCapsule } from "@/lib/dental/tooth-shapes";
import {
  TOOTH_CONDITION_COLORS, TOOTH_CONDITION_LABELS,
  type ToothCondition,
} from "@/lib/types/database";

interface ToothSVGProps {
  number: number;
  condition: ToothCondition;
  selected: boolean;
  dimmed?: boolean;
  onClick: () => void;
}

export function ToothSVG({ number, condition, selected, dimmed, onClick }: ToothSVGProps) {
  const upper = isUpperJaw(number);
  const type = getToothType(number);
  const cap = getToothCapsule(number, type);
  const w = cap.width;
  const h = cap.height;
  const cx = w / 2;
  const color = TOOTH_CONDITION_COLORS[condition];
  const isMissing = condition === "missing";
  const isHealthy = condition === "healthy";
  const isImplant = condition === "implant";

  const neckY = upper ? h * 0.48 : h * 0.52;
  const crownTop = upper ? neckY : h * 0.14;
  const crownBot = upper ? h * 0.82 : neckY;
  const rootTop = upper ? h * 0.08 : neckY;
  const rootBot = upper ? neckY : h * 0.88;

  const crownRx = w * 0.38;
  const crownRy = (crownBot - crownTop) * 0.42;

  const rootLines = (): { x: number }[] => {
    if (cap.rootCount === 1) return [{ x: cx }];
    if (cap.rootCount === 2) return [{ x: cx - w * 0.14 }, { x: cx + w * 0.14 }];
    return [{ x: cx - w * 0.18 }, { x: cx }, { x: cx + w * 0.18 }];
  };

  const crownFill = isMissing
    ? "none"
    : isHealthy
      ? "#f8fafc"
      : color;

  const crownOpacity = isHealthy || isMissing ? 1 : 0.88;

  return (
    <g
      className={clsx("cursor-pointer", dimmed && "opacity-20")}
      onClick={onClick}
      role="button"
      aria-label={`${number} ${TOOTH_NAMES_AR[number]} — ${TOOTH_CONDITION_LABELS[condition]}`}
    >
      <title>{`${number} — ${TOOTH_NAMES_AR[number]} — ${TOOTH_CONDITION_LABELS[condition]}`}</title>

      {selected && (
        <ellipse
          cx={cx}
          cy={(crownTop + crownBot) / 2}
          rx={crownRx + 7}
          ry={crownRy + 8}
          fill="none"
          stroke="#22d3ee"
          strokeWidth="2.5"
          opacity="0.95"
        />
      )}

      {/* Roots — wireframe style */}
      {!isMissing && !isImplant && rootLines().map(({ x }, i) => (
        <line
          key={i}
          x1={x}
          y1={rootTop}
          x2={x}
          y2={rootBot}
          stroke={condition === "root_canal" ? color : "#cbd5e1"}
          strokeWidth={condition === "root_canal" ? 2.5 : 1.6}
          strokeLinecap="round"
          opacity={0.85}
        />
      ))}

      {/* Implant screw */}
      {isImplant && (
        <g opacity="0.9">
          <rect x={cx - 2} y={upper ? rootTop + 2 : rootTop} width="4" height={rootBot - rootTop - 4} rx="1" fill="#94a3b8" />
          {[0, 1, 2].map((i) => (
            <line key={i} x1={cx - 5} x2={cx + 5} y1={rootTop + 6 + i * 5} y2={rootTop + 6 + i * 5} stroke="#64748b" strokeWidth="0.7" />
          ))}
        </g>
      )}

      {/* Crown capsule */}
      <ellipse
        cx={cx}
        cy={(crownTop + crownBot) / 2}
        rx={crownRx}
        ry={crownRy}
        fill={crownFill}
        fillOpacity={crownOpacity}
        stroke={
          selected ? "#22d3ee"
            : isMissing ? "#64748b"
            : isHealthy ? "#e2e8f0"
            : color
        }
        strokeWidth={selected ? 2.5 : isMissing ? 1.8 : 1.5}
        strokeDasharray={isMissing ? "4 3" : undefined}
      />

      {/* Incisal edge line for incisors/canines */}
      {(type === "incisor" || type === "canine") && !isMissing && (
        <line
          x1={cx - crownRx * 0.6}
          y1={upper ? crownBot - 2 : crownTop + 2}
          x2={cx + crownRx * 0.6}
          y2={upper ? crownBot - 2 : crownTop + 2}
          stroke="#e2e8f0"
          strokeWidth="1"
          opacity="0.8"
        />
      )}

      {/* Molar cusp hint */}
      {type === "molar" && !isMissing && isHealthy && (
        <>
          <line x1={cx - crownRx * 0.35} y1={(crownTop + crownBot) / 2 - 3} x2={cx - crownRx * 0.35} y2={(crownTop + crownBot) / 2 + 3} stroke="#e2e8f0" strokeWidth="0.8" />
          <line x1={cx + crownRx * 0.35} y1={(crownTop + crownBot) / 2 - 3} x2={cx + crownRx * 0.35} y2={(crownTop + crownBot) / 2 + 3} stroke="#e2e8f0" strokeWidth="0.8" />
        </>
      )}

      {isMissing && (
        <g stroke="#64748b" strokeWidth="2" strokeLinecap="round" opacity="0.75">
          <line x1={cx - crownRx * 0.5} y1={(crownTop + crownBot) / 2 - 4} x2={cx + crownRx * 0.5} y2={(crownTop + crownBot) / 2 + 4} />
          <line x1={cx + crownRx * 0.5} y1={(crownTop + crownBot) / 2 - 4} x2={cx - crownRx * 0.5} y2={(crownTop + crownBot) / 2 + 4} />
        </g>
      )}

      {/* FDI number badge */}
      <rect
        x={cx - 11}
        y={upper ? h - 11 : 1}
        width="22"
        height="11"
        rx="3"
        fill={selected ? "#0891b2" : "rgba(15,23,42,0.8)"}
        stroke={selected ? "#22d3ee" : "rgba(100,116,139,0.5)"}
        strokeWidth="0.5"
      />
      <text
        x={cx}
        y={upper ? h - 3.5 : 9}
        textAnchor="middle"
        fontSize="7"
        fontWeight="700"
        fill="#e2e8f0"
        fontFamily="system-ui, sans-serif"
      >
        {number}
      </text>

      {/* Status dot */}
      {!isMissing && (
        <circle
          cx={cx}
          cy={upper ? h - 14 : 16}
          r="2.2"
          fill={isHealthy ? "#22c55e" : color}
          opacity="0.95"
        />
      )}
    </g>
  );
}
