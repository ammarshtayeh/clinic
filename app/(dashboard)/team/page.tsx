"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useClinic } from "@/lib/hooks/use-clinic";
import { PageHeader, Card, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { ROLE_LABELS, type ClinicMember, type MemberRole } from "@/lib/types/database";
import { UserPlus } from "lucide-react";

export default function TeamPage() {
  const { clinic, membership } = useClinic();
  const [members, setMembers] = useState<ClinicMember[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "doctor" as MemberRole, phone: "" });
  const supabase = createClient();
  const isOwner = membership?.role === "owner";

  const load = () => {
    if (!clinic) return;
    supabase
      .from("clinic_members")
      .select("*, profile:profiles(full_name, phone)")
      .eq("clinic_id", clinic.id)
      .eq("is_active", true)
      .then(({ data }) => setMembers((data ?? []) as ClinicMember[]));
  };

  useEffect(() => { load(); }, [clinic, supabase]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/team/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "حدث خطأ");
      setLoading(false);
      return;
    }

    setForm({ fullName: "", email: "", password: "", role: "doctor", phone: "" });
    setShowForm(false);
    setLoading(false);
    load();
  };

  return (
    <div>
      <PageHeader
        title="فريق العيادة"
        description="إدارة أعضاء الفريق وصلاحياتهم"
        action={isOwner && (
          <Button onClick={() => setShowForm(!showForm)}>
            <UserPlus size={16} className="ml-2 inline" />إضافة عضو
          </Button>
        )}
      />

      {showForm && isOwner && (
        <Card className="mb-6">
          <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-2">
            {error && <div className="sm:col-span-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
            <Input label="الاسم الكامل *" value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} required />
            <Input label="البريد الإلكتروني *" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required dir="ltr" />
            <Input label="كلمة المرور *" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required dir="ltr" />
            <Input label="الهاتف" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} dir="ltr" />
            <Select
              label="الدور"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as MemberRole }))}
              options={[
                { value: "doctor", label: "طبيب" },
                { value: "receptionist", label: "استقبال" },
                { value: "accountant", label: "محاسب" },
              ]}
            />
            <div className="sm:col-span-2">
              <Button type="submit" loading={loading}>إضافة العضو</Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="table-shell">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-4 py-3 text-right font-medium text-slate-600">الاسم</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">الدور</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">الهاتف</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b border-slate-50">
                  <td className="px-4 py-3 font-medium">{(m as { profile?: { full_name: string } }).profile?.full_name ?? "—"}</td>
                  <td className="px-4 py-3"><Badge color="#8b5cf6">{ROLE_LABELS[m.role]}</Badge></td>
                  <td className="px-4 py-3" dir="ltr">{(m as { profile?: { phone: string } }).profile?.phone ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
