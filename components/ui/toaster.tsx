"use client";

import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { useToastStore } from "@/lib/toast-store";
import clsx from "clsx";

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const styles = {
  success: "border-emerald-200/60 bg-emerald-50/95 text-emerald-800",
  error: "border-rose-200/60 bg-rose-50/95 text-rose-800",
  info: "border-sky-200/60 bg-sky-50/95 text-sky-800",
};

export function Toaster() {
  const { toasts, remove } = useToastStore();

  return (
    <div className="fixed bottom-6 left-6 z-[100] flex flex-col gap-3">
      {toasts.map((t) => {
        const Icon = icons[t.type];
        return (
          <div
            key={t.id}
            className={clsx(
              "flex min-w-[280px] max-w-sm items-center gap-3 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-xl animate-in slide-in-from-bottom-4",
              styles[t.type]
            )}
          >
            <Icon size={20} className="shrink-0" />
            <p className="flex-1 text-sm font-medium">{t.message}</p>
            <button onClick={() => remove(t.id)} className="opacity-60 hover:opacity-100">
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
