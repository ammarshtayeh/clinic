import clsx from "clsx";

type BadgeTone = "default" | "success" | "warning" | "danger";

const toneMap: Record<BadgeTone, string> = {
  default: "border-slate-200 bg-slate-100/85 text-slate-700",
  success: "border-emerald-200 bg-emerald-50/90 text-emerald-700",
  warning: "border-amber-200 bg-amber-50/90 text-amber-700",
  danger: "border-rose-200 bg-rose-50/90 text-rose-700",
};

export function Badge({ label, tone = "default" }: { label: string; tone?: BadgeTone }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold shadow-[0_8px_20px_-14px_rgba(15,23,42,0.45)]",
        toneMap[tone],
      )}
    >
      {label}
    </span>
  );
}
