"use client";

import clsx from "clsx";
import { getToothType, isUpperJaw, TOOTH_NAMES_AR } from "@/lib/dental/fdi";
import { getToothShape, getViewBox } from "@/lib/dental/tooth-shapes";
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
  const shape = getToothShape(number, type, upper);
  const color = TOOTH_CONDITION_COLORS[condition];
  const isMissing = condition === "missing";
  const isHealthy = condition === "healthy";
  const isImplant = condition === "implant";
  const uid = `t${number}`;

  return (
    <g
      className={clsx("cursor-pointer transition-opacity", dimmed && "opacity-15")}
      onClick={onClick}
      role="button"
      aria-label={`${number} ${TOOTH_NAMES_AR[number]} — ${TOOTH_CONDITION_LABELS[condition]}`}
    >
      <title>{`${number} — ${TOOTH_NAMES_AR[number]} — ${TOOTH_CONDITION_LABELS[condition]}`}</title>

      {/* Selection glow */}
      {selected && (
        <ellipse
          cx={shape.width / 2}
          cy={shape.height / 2}
          rx={shape.width / 2 + 6}
          ry={shape.height / 2 + 4}
          fill="none"
          stroke="#22d3ee"
          strokeWidth="2"
          opacity="0.9"
        />
      )}

      <defs>
        <linearGradient id={`${uid}-enamel`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
        <linearGradient id={`${uid}-cond`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={`${color}dd`} />
          <stop offset="100%" stopColor={`${color}88`} />
        </linearGradient>
        <filter id={`${uid}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0f172a" floodOpacity="0.35" />
        </filter>
      </defs>

      <g filter={`url(#${uid}-shadow)`}>
        {/* Roots */}
        {!isMissing && shape.roots.map((d, i) => (
          <path
            key={`r${i}`}
            d={d}
            fill="none"
            stroke={condition === "root_canal" ? color : "#94a3b8"}
            strokeWidth={condition === "root_canal" ? 2.8 : 1.8}
            strokeLinecap="round"
            opacity={condition === "root_canal" ? 1 : 0.75}
          />
        ))}

        {/* Implant post */}
        {isImplant && (
          <g opacity="0.9">
            <rect
              x={shape.width / 2 - 2.5}
              y={upper ? shape.height * 0.42 : shape.height * 0.38}
              width="5"
              height={upper ? 18 : 18}
              rx="1"
              fill="#64748b"
            />
            {[0, 1, 2, 3].map((i) => (
              <line
                key={i}
                x1={shape.width / 2 - 6}
                x2={shape.width / 2 + 6}
                y1={(upper ? 46 : 42) + i * 3.5}
                y2={(upper ? 46 : 42) + i * 3.5}
                stroke="#475569"
                strokeWidth="0.8"
              />
            ))}
          </g>
        )}

        {/* Gingival line */}
        {shape.gingiva && !isMissing && (
          <path d={shape.gingiva} fill="none" stroke="#f472b6" strokeWidth="1.2" opacity="0.55" strokeLinecap="round" />
        )}

        {/* Crown body */}
        <path
          d={shape.crown}
          fill={
            isMissing ? "none"
              : isHealthy ? `url(#${uid}-enamel)`
              : `url(#${uid}-cond)`
          }
          stroke={
            selected ? "#22d3ee"
              : isMissing ? "#64748b"
              : isHealthy ? "#cbd5e1"
              : color
          }
          strokeWidth={selected ? 2.2 : isMissing ? 1.5 : 1.6}
          strokeDasharray={isMissing ? "3 2.5" : undefined}
        />

        {/* Enamel cusp anatomy */}
        {shape.cusps?.map((d, i) => (
          <path key={`c${i}`} d={d} fill="none" stroke="#cbd5e1" strokeWidth="0.7" opacity="0.8" />
        ))}

        {shape.incisal && !isMissing && (
          <path d={shape.incisal} fill="none" stroke="#cbd5e1" strokeWidth="0.8" opacity="0.7" />
        )}

        {shape.highlight && isHealthy && (
          <path d={shape.highlight} fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.8" strokeLinecap="round" />
        )}

        {/* Condition markers */}
        {condition === "cavity" && !isMissing && (
          <circle cx={shape.width / 2} cy={upper ? shape.height * 0.62 : shape.height * 0.38} r="3.5" fill={color} opacity="0.9" />
        )}
        {condition === "filling" && !isMissing && (
          <ellipse cx={shape.width / 2} cy={upper ? shape.height * 0.58 : shape.height * 0.42} rx="4.5" ry="3" fill={color} opacity="0.85" />
        )}
        {condition === "crown" && !isMissing && (
          <path
            d={upper
              ? `M${shape.width * 0.15},${shape.height * 0.55} Q${shape.width / 2},${shape.height * 0.48} ${shape.width * 0.85},${shape.height * 0.55} L${shape.width * 0.8},${shape.height * 0.68} Q${shape.width / 2},${shape.height * 0.62} ${shape.width * 0.2},${shape.height * 0.68} Z`
              : `M${shape.width * 0.15},${shape.height * 0.45} Q${shape.width / 2},${shape.height * 0.52} ${shape.width * 0.85},${shape.height * 0.45} L${shape.width * 0.8},${shape.height * 0.32} Q${shape.width / 2},${shape.height * 0.38} ${shape.width * 0.2},${shape.height * 0.32} Z`}
            fill={`${color}aa`}
            stroke={color}
            strokeWidth="0.8"
          />
        )}

        {isMissing && (
          <g stroke="#64748b" strokeWidth="2" strokeLinecap="round" opacity="0.8">
            <line x1={shape.width * 0.25} y1={shape.height * 0.45} x2={shape.width * 0.75} y2={shape.height * 0.55} />
            <line x1={shape.width * 0.75} y1={shape.height * 0.45} x2={shape.width * 0.25} y2={shape.height * 0.55} />
          </g>
        )}

        {/* Healthy status dot */}
        {isHealthy && !selected && (
          <circle cx={shape.width / 2} cy={upper ? shape.height - 4 : 4} r="2" fill="#22c55e" opacity="0.85" />
        )}

        {/* Condition status dot (non-healthy) */}
        {!isHealthy && !isMissing && (
          <circle cx={shape.width / 2} cy={upper ? shape.height - 4 : 4} r="2.5" fill={color} />
        )}
      </g>

      {/* FDI number */}
      <rect
        x={shape.width / 2 - 10}
        y={upper ? shape.height + 2 : -14}
        width="20"
        height="12"
        rx="3"
        fill={selected ? "#0891b2" : "rgba(15,23,42,0.75)"}
        stroke={selected ? "#22d3ee" : "rgba(148,163,184,0.4)"}
        strokeWidth="0.5"
      />
      <text
        x={shape.width / 2}
        y={upper ? shape.height + 10.5 : -5.5}
        textAnchor="middle"
        fontSize="7.5"
        fontWeight="800"
        fill="#f8fafc"
        fontFamily="system-ui, sans-serif"
      >
        {number}
      </text>
    </g>
  );
}
