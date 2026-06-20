"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useClinic } from "@/lib/hooks/use-clinic";
import { PageHeader, Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { toast } from "@/lib/toast-store";
import { ROLE_LABELS, type ClinicMember, type MemberRole } from "@/lib/types/database";
import { UserPlus } from "lucide-react";

export default function TeamPage() {
  const { clinic, membership } = useClinic();
  const [members, setMembers] = useState<ClinicMember[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "doctor" as MemberRole, phone: "" });
  const supabase = createClient();
  const isOwner = membership?.role === "owner";

  const load = () => {
    if (!clinic) return;
    supabase.from("clinic_members").select("*, profile:profiles(full_name, phone)")
      .eq("clinic_id", clinic.id).eq("is_active", true)
      .then(({ data }) => setMembers((data ?? []) as ClinicMember[]));
  };

  useEffect(() => { load(); }, [clinic, supabase]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/team/create", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error ?? "حدث خطأ"); setLoading(false); return; }
    toast.success("تم إضافة العضو");
    setForm({ fullName: "", email: "", password: "", role: "doctor", phone: "" });
    setShowForm(false); setLoading(false); load();
  };

  return (
    <div>
      <PageHeader title="الفريق" description="إدارة أعضاء عيادتك"
        action={isOwner && <Button onClick={() => setShowForm(!showForm)} size="sm"><UserPlus size={16} className="ml-1 inline" />إضافة</Button>} />

      {showForm && isOwner && (
        <Card className="mb-6">
          <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-2">
            <Input label="الاسم *" value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} required />
            <Input label="البريد *" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required dir="ltr" />
            <Input label="كلمة المرور *" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required dir="ltr" />
            <Select label="الدور" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as MemberRole }))}
              options={[{ value: "doctor", label: "طبيب" }, { value: "receptionist", label: "استقبال" }, { value: "accountant", label: "محاسب" }]} />
            <div className="sm:col-span-2"><Button type="submit" loading={loading}>إضافة</Button></div>
          </form>
        </Card>
      )}

      <Card>
        <div className="space-y-2">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
              <div>
                <p className="font-bold">{(m as { profile?: { full_name: string } }).profile?.full_name ?? "—"}</p>
                <p className="text-xs text-slate-400" dir="ltr">{(m as { profile?: { phone: string } }).profile?.phone}</p>
              </div>
              <Badge variant="gold">{ROLE_LABELS[m.role]}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
