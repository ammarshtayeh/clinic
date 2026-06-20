"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PageHeader, Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { toast } from "@/lib/toast-store";
import type { Invoice, InvoiceItem } from "@/lib/types/database";
import { Printer } from "lucide-react";

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const supabase = createClient();

  const load = async () => {
    if (!id) return;
    const [inv, itms] = await Promise.all([
      supabase.from("invoices").select("*, patient:patients(full_name, file_number)").eq("id", id).single(),
      supabase.from("invoice_items").select("*").eq("invoice_id", id),
    ]);
    setInvoice(inv.data as Invoice);
    setItems(itms.data ?? []);
  };

  useEffect(() => { load(); }, [id, supabase]);

  const handlePayment = async () => {
    if (!invoice || !paymentAmount) return;
    const amount = parseFloat(paymentAmount);
    await supabase.from("payments").insert({ invoice_id: invoice.id, amount, method: paymentMethod as "cash" });
    const newPaid = invoice.paid_amount + amount;
    const status = newPaid >= invoice.total ? "paid" : "partial";
    await supabase.from("invoices").update({ paid_amount: newPaid, status }).eq("id", invoice.id);
    toast.success("تم تسجيل الدفعة");
    setPaymentAmount("");
    load();
  };

  if (!invoice) return <div className="py-12 text-center text-slate-400">جاري التحميل...</div>;

  return (
    <div>
      <PageHeader
        title={`فاتورة ${invoice.invoice_number}`}
        description={invoice.patient?.full_name}
        action={
          <div className="flex items-center gap-2">
            <StatusBadge status={invoice.status} type="invoice" />
            <Link href={`/invoices/${id}/print`} target="_blank">
              <Button variant="gold" size="sm"><Printer size={14} className="ml-1 inline" />طباعة PDF</Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="البنود" className="lg:col-span-2">
          <div className="table-shell">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-slate-50">
                <th className="px-4 py-3 text-right font-bold">الوصف</th>
                <th className="px-4 py-3 text-right font-bold">الكمية</th>
                <th className="px-4 py-3 text-right font-bold">السعر</th>
                <th className="px-4 py-3 text-right font-bold">المجموع</th>
              </tr></thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-50">
                    <td className="px-4 py-3">{item.description}</td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3">{item.unit_price} ₪</td>
                    <td className="px-4 py-3 font-bold">{item.total} ₪</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 space-y-1 rounded-2xl bg-slate-50 p-4 text-sm">
            <div className="flex justify-between"><span>المجموع</span><span>{invoice.subtotal} ₪</span></div>
            <div className="flex justify-between"><span>الخصم</span><span>{invoice.discount} ₪</span></div>
            <div className="flex justify-between text-lg font-black"><span>الإجمالي</span><span>{invoice.total} ₪</span></div>
            <div className="flex justify-between text-emerald-600"><span>المدفوع</span><span>{invoice.paid_amount} ₪</span></div>
            <div className="flex justify-between text-rose-600 font-bold"><span>المتبقي</span><span>{invoice.total - invoice.paid_amount} ₪</span></div>
          </div>
        </Card>

        {invoice.status !== "paid" && invoice.status !== "void" && (
          <Card title="تسجيل دفعة">
            <div className="space-y-4">
              <Input label="المبلغ (₪)" type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} dir="ltr" />
              <Select label="طريقة الدفع" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
                options={[{ value: "cash", label: "نقدي" }, { value: "card", label: "بطاقة" }, { value: "transfer", label: "تحويل" }, { value: "insurance", label: "تأمين" }]} />
              <Button onClick={handlePayment} className="w-full">تسجيل</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
