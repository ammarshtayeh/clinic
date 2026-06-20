"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useClinic } from "@/lib/hooks/use-clinic";
import { PageHeader, Card, EmptyState } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/ui/dialog";
import type { Invoice } from "@/lib/types/database";
import { Plus } from "lucide-react";

export default function InvoicesPage() {
  const { clinic } = useClinic();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!clinic) return;
    supabase.from("invoices").select("*, patient:patients(full_name)").eq("clinic_id", clinic.id)
      .order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => { setInvoices((data ?? []) as Invoice[]); setLoading(false); });
  }, [clinic, supabase]);

  return (
    <div>
      <PageHeader title="الفواتير" action={<Link href="/invoices/new"><Button size="sm"><Plus size={16} className="ml-1 inline" />فاتورة</Button></Link>} />
      <Card>
        {loading ? <TableSkeleton /> : invoices.length === 0 ? (
          <EmptyState title="لا فواتير" />
        ) : (
          <div className="space-y-2">
            {invoices.map((inv) => (
              <Link key={inv.id} href={`/invoices/${inv.id}`} className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 transition hover:border-cyan-200 hover:shadow-sm">
                <div>
                  <p className="font-bold text-cyan-700">{inv.invoice_number}</p>
                  <p className="text-sm text-slate-500">{inv.patient?.full_name} · {inv.total} ₪</p>
                </div>
                <StatusBadge status={inv.status} type="invoice" />
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
