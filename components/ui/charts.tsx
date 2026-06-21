"use client";

import clsx from "clsx";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function TrendBadge({ value, suffix = "%" }: { value: number; suffix?: string }) {
  const up = value >= 0;
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold",
        up ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"
      )}
    >
      {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      {Math.abs(value)}
      {suffix}
    </span>
  );
}

export function MiniBars({
  data,
  color = "#06b6d4",
  height = 120,
  dark,
}: {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
  dark?: boolean;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d, i) => {
        const h = Math.max(4, (d.value / max) * (height - 22));
        return (
          <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1.5">
            <span className={clsx("text-[10px] font-bold", dark ? "text-slate-400" : "text-slate-500")}>{d.value}</span>
            <div
              className="w-full rounded-t-lg transition-all hover:opacity-80"
              style={{
                height: h,
                background: `linear-gradient(180deg, ${color}, ${color}99)`,
              }}
              title={`${d.label}: ${d.value}`}
            />
            <span className={clsx("text-[10px] font-medium", dark ? "text-slate-500" : "text-slate-400")}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function Sparkline({
  data,
  color = "#06b6d4",
  width = 240,
  height = 56,
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const pts = data.map((v, i) => [i * step, height - ((v - min) / range) * (height - 8) - 4]);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  const id = `spark-${color.replace("#", "")}`;
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Donut({
  segments,
  size = 160,
  thickness = 22,
  centerLabel,
  centerValue,
  dark,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string | number;
  dark?: boolean;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} className="shrink-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={dark ? "#1e293b" : "#eef2f7"} strokeWidth={thickness} />
        {segments.map((s, i) => {
          const len = (s.value / total) * c;
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="space-y-1.5">
        {(centerValue !== undefined || centerLabel) && (
          <div className="mb-2">
            <p className={clsx("text-2xl font-black", dark ? "text-white" : "text-slate-900")}>{centerValue}</p>
            <p className={clsx("text-xs", dark ? "text-slate-400" : "text-slate-500")}>{centerLabel}</p>
          </div>
        )}
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
            <span className={clsx("font-semibold", dark ? "text-slate-300" : "text-slate-600")}>{s.label}</span>
            <span className={clsx("font-bold", dark ? "text-white" : "text-slate-900")}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProgressBar({
  value,
  max = 100,
  color = "#06b6d4",
  dark,
}: {
  value: number;
  max?: number;
  color?: string;
  dark?: boolean;
}) {
  const pct = Math.min(100, (value / (max || 1)) * 100);
  return (
    <div className={clsx("h-2 w-full overflow-hidden rounded-full", dark ? "bg-white/10" : "bg-slate-100")}>
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}
