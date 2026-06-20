"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useClinic } from "@/lib/hooks/use-clinic";
import { PageHeader, Card, EmptyState, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { INVOICE_STATUS_LABELS } from "@/lib/types/database";
import type { Invoice } from "@/lib/types/database";
import { Plus } from "lucide-react";

export default function InvoicesPage() {
  const { clinic } = useClinic();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!clinic) return;
    supabase
      .from("invoices")
      .select("*, patient:patients(full_name)")
      .eq("clinic_id", clinic.id)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setInvoices((data ?? []) as Invoice[]);
        setLoading(false);
      });
  }, [clinic, supabase]);

  return (
    <div>
      <PageHeader
        title="الفواتير"
        description="إدارة الفواتير والمدفوعات"
        action={
          <Link href="/invoices/new">
            <Button><Plus size={16} className="ml-2 inline" />فاتورة جديدة</Button>
          </Link>
        }
      />

      <Card>
        {loading ? (
          <div className="py-12 text-center text-slate-400">جاري التحميل...</div>
        ) : invoices.length === 0 ? (
          <EmptyState title="لا توجد فواتير" />
        ) : (
          <div className="table-shell">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-4 py-3 text-right font-medium text-slate-600">رقم الفاتورة</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">المريض</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">المبلغ</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">المدفوع</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <Link href={`/invoices/${inv.id}`} className="font-medium text-cyan-600 hover:underline">{inv.invoice_number}</Link>
                    </td>
                    <td className="px-4 py-3">{inv.patient?.full_name}</td>
                    <td className="px-4 py-3">{inv.total} ₪</td>
                    <td className="px-4 py-3">{inv.paid_amount} ₪</td>
                    <td className="px-4 py-3"><Badge>{INVOICE_STATUS_LABELS[inv.status]}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
