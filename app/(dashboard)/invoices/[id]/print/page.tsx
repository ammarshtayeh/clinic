"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useClinic } from "@/lib/hooks/use-clinic";
import { BRAND } from "@/lib/brand";
import { INVOICE_STATUS_LABELS } from "@/lib/types/database";
import type { Invoice, InvoiceItem } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export default function InvoicePrintPage() {
  const { id } = useParams<{ id: string }>();
  const { clinic } = useClinic();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from("invoices").select("*, patient:patients(full_name, file_number, phone)").eq("id", id).single(),
      supabase.from("invoice_items").select("*").eq("invoice_id", id),
    ]).then(([inv, itms]) => {
      setInvoice(inv.data as Invoice);
      setItems(itms.data ?? []);
    });
  }, [id, supabase]);

  useEffect(() => {
    if (invoice && typeof window !== "undefined" && window.location.search.includes("auto=1")) {
      setTimeout(() => window.print(), 500);
    }
  }, [invoice]);

  if (!invoice) return <div className="p-8 text-center">جاري التحميل...</div>;

  const patient = invoice.patient as { full_name: string; file_number: string; phone: string | null } | undefined;

  return (
    <>
      <div className="no-print fixed left-4 top-4 z-50 flex gap-2">
        <Button onClick={() => window.print()}><Printer size={16} className="ml-2 inline" />طباعة / PDF</Button>
        <Link href={`/invoices/${id}`}><Button variant="ghost">← رجوع</Button></Link>
      </div>

      <div className="print-area mx-auto max-w-2xl p-8">
        <div className="mb-8 flex items-start justify-between border-b-2 border-slate-900 pb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900">{clinic?.name ?? "العيادة"}</h1>
            {clinic?.phone && <p className="text-sm text-slate-500" dir="ltr">{clinic.phone}</p>}
            {clinic?.address && <p className="text-sm text-slate-500">{clinic.address}</p>}
          </div>
          <div className="text-left">
            <p className="text-3xl font-black text-cyan-600">فاتورة</p>
            <p className="font-bold" dir="ltr">{invoice.invoice_number}</p>
            <p className="text-sm text-slate-500">{INVOICE_STATUS_LABELS[invoice.status]}</p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-bold text-slate-500">المريض</p>
            <p className="font-black">{patient?.full_name}</p>
            <p className="text-slate-500">#{patient?.file_number}</p>
          </div>
          <div className="text-left">
            <p className="font-bold text-slate-500">التاريخ</p>
            <p dir="ltr">{new Date(invoice.created_at).toLocaleDateString("ar")}</p>
          </div>
        </div>

        <table className="mb-6 w-full text-sm">
          <thead>
            <tr className="border-b-2 border-slate-900">
              <th className="py-2 text-right font-black">الوصف</th>
              <th className="py-2 text-center font-black">الكمية</th>
              <th className="py-2 text-center font-black">السعر</th>
              <th className="py-2 text-left font-black">المجموع</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-slate-200">
                <td className="py-3">{item.description}</td>
                <td className="py-3 text-center">{item.quantity}</td>
                <td className="py-3 text-center" dir="ltr">{item.unit_price} ₪</td>
                <td className="py-3 text-left font-bold" dir="ltr">{item.total} ₪</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="space-y-1 text-left text-sm" dir="ltr">
          <div className="flex justify-between"><span>Subtotal</span><span>{invoice.subtotal} ₪</span></div>
          {invoice.discount > 0 && <div className="flex justify-between text-rose-600"><span>Discount</span><span>-{invoice.discount} ₪</span></div>}
          <div className="flex justify-between border-t-2 border-slate-900 pt-2 text-lg font-black"><span>Total</span><span>{invoice.total} ₪</span></div>
          <div className="flex justify-between text-emerald-600"><span>Paid</span><span>{invoice.paid_amount} ₪</span></div>
          {invoice.total - invoice.paid_amount > 0 && (
            <div className="flex justify-between font-bold text-rose-600"><span>Remaining</span><span>{invoice.total - invoice.paid_amount} ₪</span></div>
          )}
        </div>

        <p className="mt-12 text-center text-xs text-slate-400">Powered by {BRAND.name} · {BRAND.domain}</p>
      </div>
    </>
  );
}
