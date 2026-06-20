"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PageHeader, Card, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { INVOICE_STATUS_LABELS } from "@/lib/types/database";
import type { Invoice, InvoiceItem } from "@/lib/types/database";

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
    await supabase.from("payments").insert({
      invoice_id: invoice.id,
      amount,
      method: paymentMethod as "cash",
    });
    const newPaid = invoice.paid_amount + amount;
    const status = newPaid >= invoice.total ? "paid" : "partial";
    await supabase.from("invoices").update({ paid_amount: newPaid, status }).eq("id", invoice.id);
    setPaymentAmount("");
    load();
  };

  if (!invoice) return <div className="py-12 text-center text-slate-400">جاري التحميل...</div>;

  return (
    <div>
      <PageHeader
        title={`فاتورة ${invoice.invoice_number}`}
        description={invoice.patient?.full_name}
        action={<Badge color="#0a91b6">{INVOICE_STATUS_LABELS[invoice.status]}</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="تفاصيل الفاتورة" className="lg:col-span-2">
          <div className="table-shell">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-4 py-3 text-right">الوصف</th>
                  <th className="px-4 py-3 text-right">الكمية</th>
                  <th className="px-4 py-3 text-right">السعر</th>
                  <th className="px-4 py-3 text-right">المجموع</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-50">
                    <td className="px-4 py-3">{item.description}</td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3">{item.unit_price} ₪</td>
                    <td className="px-4 py-3 font-medium">{item.total} ₪</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 space-y-1 text-sm text-left" dir="ltr">
            <p>Subtotal: {invoice.subtotal} ₪</p>
            <p>Discount: {invoice.discount} ₪</p>
            <p className="text-lg font-bold">Total: {invoice.total} ₪</p>
            <p className="text-green-600">Paid: {invoice.paid_amount} ₪</p>
            <p className="text-rose-600">Remaining: {invoice.total - invoice.paid_amount} ₪</p>
          </div>
        </Card>

        {invoice.status !== "paid" && invoice.status !== "void" && (
          <Card title="تسجيل دفعة">
            <div className="space-y-4">
              <Input label="المبلغ (₪)" type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} dir="ltr" />
              <Select
                label="طريقة الدفع"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                options={[
                  { value: "cash", label: "نقدي" },
                  { value: "card", label: "بطاقة" },
                  { value: "transfer", label: "تحويل" },
                  { value: "insurance", label: "تأمين" },
                ]}
              />
              <Button onClick={handlePayment} className="w-full">تسجيل الدفعة</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
