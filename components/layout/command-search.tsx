"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, Calendar, FileText, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useClinic } from "@/lib/hooks/use-clinic";

interface SearchResult {
  id: string;
  type: "patient" | "appointment" | "invoice";
  label: string;
  sub: string;
  href: string;
}

export function CommandSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { clinic } = useClinic();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!open) { setQuery(""); setResults([]); }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const search = useCallback(async (q: string) => {
    if (!clinic || q.length < 2) { setResults([]); return; }
    setLoading(true);

    const [patients, invoices] = await Promise.all([
      supabase.from("patients").select("id, full_name, file_number, phone")
        .eq("clinic_id", clinic.id).eq("is_active", true)
        .or(`full_name.ilike.%${q}%,file_number.ilike.%${q}%,phone.ilike.%${q}%`).limit(5),
      supabase.from("invoices").select("id, invoice_number, patient:patients(full_name)")
        .eq("clinic_id", clinic.id).ilike("invoice_number", `%${q}%`).limit(3),
    ]);

    const res: SearchResult[] = [
      ...(patients.data ?? []).map((p) => ({
        id: p.id, type: "patient" as const,
        label: p.full_name, sub: `#${p.file_number}${p.phone ? ` · ${p.phone}` : ""}`,
        href: `/patients/${p.id}`,
      })),
      ...(invoices.data ?? []).map((inv) => ({
        id: inv.id, type: "invoice" as const,
        label: inv.invoice_number,
        sub: ((inv.patient as unknown) as { full_name: string } | null)?.full_name ?? "",
        href: `/invoices/${inv.id}`,
      })),
    ];
    setResults(res);
    setLoading(false);
  }, [clinic, supabase]);

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  const icons = { patient: Users, appointment: Calendar, invoice: FileText };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center p-4 pt-[15vh]">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl animate-slide-up">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <Search size={20} className="text-slate-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن مريض، فاتورة..."
            className="flex-1 border-0 bg-transparent text-base font-medium outline-none"
          />
          <button onClick={onClose}><X size={18} className="text-slate-400" /></button>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {loading && <p className="p-4 text-center text-sm text-slate-400">جاري البحث...</p>}
          {!loading && query.length >= 2 && results.length === 0 && (
            <p className="p-4 text-center text-sm text-slate-400">لا توجد نتائج</p>
          )}
          {results.map((r) => {
            const Icon = icons[r.type];
            return (
              <button
                key={`${r.type}-${r.id}`}
                onClick={() => { router.push(r.href); onClose(); }}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-right transition hover:bg-slate-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="font-bold text-slate-800">{r.label}</p>
                  <p className="text-xs text-slate-400">{r.sub}</p>
                </div>
              </button>
            );
          })}
          {query.length < 2 && (
            <p className="p-4 text-center text-sm text-slate-400">اكتب حرفين على الأقل للبحث</p>
          )}
        </div>
      </div>
    </div>
  );
}
