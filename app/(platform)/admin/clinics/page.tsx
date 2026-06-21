"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/status-badge";
import { TableSkeleton } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AdminCard, PlanPill } from "@/components/layout/admin-ui";
import { ProgressBar } from "@/components/ui/charts";
import { toast } from "@/lib/toast-store";
import { useClinics } from "@/lib/admin/use-clinics";
import { STATUS_STYLES, fmtMoney, fmtDate, daysUntil } from "@/lib/admin/metrics";
import { uid } from "@/lib/mock/seed";
import { createClient } from "@/lib/supabase/client";
import { PLANS, SUBSCRIPTION_STATUS_LABELS, SEAT_PRICE } from "@/lib/types/database";
import type { Clinic, PlanTier, SubscriptionStatus } from "@/lib/types/database";
import {
  Search, Plus, Power, PowerOff, X, MapPin, Phone, Mail, Users, CalendarCheck,
  UserCog, CreditCard, Building2, Minus, KeyRound, Copy, Check,
} from "lucide-react";

type StatusFilter = "all" | SubscriptionStatus;

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "active", label: "نشطة" },
  { key: "trialing", label: "تجريبي" },
  { key: "past_due", label: "متأخرة" },
  { key: "suspended", label: "موقوفة" },
];

export default function AdminClinicsPage() {
  const { clinics, loading, reload, update } = useClinics();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [planFilter, setPlanFilter] = useState<PlanTier | "all">("all");
  const [selected, setSelected] = useState<Clinic | null>(null);
  const [adding, setAdding] = useState(false);

  const filtered = useMemo(() => {
    return clinics.filter((c) => {
      if (status !== "all" && c.subscription_status !== status) return false;
      if (planFilter !== "all" && c.plan !== planFilter) return false;
      if (q) {
        const t = q.toLowerCase();
        return [c.name, c.city, c.owner_name, c.email].some((v) => (v ?? "").toLowerCase().includes(t));
      }
      return true;
    });
  }, [clinics, q, status, planFilter]);

  const toggleActive = async (c: Clinic) => {
    const suspend = c.subscription_status !== "suspended";
    await update(c.id, {
      subscription_status: suspend ? "suspended" : "active",
      is_active: !suspend,
    });
    toast.success(suspend ? "تم إيقاف العيادة" : "تم تفعيل العيادة");
    if (selected?.id === c.id) setSelected({ ...c, subscription_status: suspend ? "suspended" : "active", is_active: !suspend });
  };

  const changePlan = async (c: Clinic, plan: PlanTier) => {
    const seats_total = Math.max(PLANS[plan].seats, c.seats_used);
    await update(c.id, { plan, monthly_fee: PLANS[plan].price, seats_total });
    toast.success(`تم تغيير الباقة إلى ${PLANS[plan].label}`);
    setSelected({ ...c, plan, monthly_fee: PLANS[plan].price, seats_total });
  };

  const setSeats = async (c: Clinic, next: number) => {
    const seats_total = Math.max(c.seats_used, next);
    await update(c.id, { seats_total });
    setSelected({ ...c, seats_total });
    if (next > c.seats_total) toast.success(`تم بيع ${next - c.seats_total} مقعد لـ ${c.name}`);
  };

  return (
    <div>
      <PageHeader
        title="إدارة العيادات"
        description="كل العيادات المشتركة في المنصة — بحث، فلترة، وإدارة الاشتراكات"
        badge={<Badge variant="gold">{clinics.length} عيادة</Badge>}
        action={<Button variant="gold" onClick={() => setAdding(true)}><Plus size={16} /> عيادة جديدة</Button>}
        dark
      />

      <AdminCard className="mb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 lg:max-w-sm">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث بالاسم أو المدينة أو المالك…"
              className="w-full rounded-2xl border-white/10 bg-white/5 py-2.5 pr-10 text-sm text-white placeholder:text-slate-500"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setStatus(f.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  status === f.key ? "bg-amber-500 text-slate-900" : "bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value as PlanTier | "all")}
              className="rounded-full border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300"
            >
              <option value="all">كل الباقات</option>
              {(Object.keys(PLANS) as PlanTier[]).map((p) => (
                <option key={p} value={p}>{PLANS[p].label}</option>
              ))}
            </select>
          </div>
        </div>
      </AdminCard>

      <AdminCard title={`النتائج (${filtered.length})`} icon={Building2}>
        {loading ? <TableSkeleton /> : filtered.length === 0 ? (
          <p className="py-12 text-center text-slate-500">لا توجد عيادات مطابقة</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-right text-xs text-slate-500">
                  <th className="px-3 py-2 font-semibold">العيادة</th>
                  <th className="px-3 py-2 font-semibold">المالك</th>
                  <th className="px-3 py-2 font-semibold">الباقة</th>
                  <th className="px-3 py-2 font-semibold">المقاعد</th>
                  <th className="px-3 py-2 font-semibold">المرضى</th>
                  <th className="px-3 py-2 font-semibold">الحالة</th>
                  <th className="px-3 py-2 font-semibold">الإيراد</th>
                  <th className="px-3 py-2 font-semibold">انضمت</th>
                  <th className="px-3 py-2 font-semibold">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className="cursor-pointer border-b border-white/5 transition hover:bg-white/[0.03]"
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-xs font-black text-amber-400">
                          {c.name.replace(/^عيادة |^مركز /, "").charAt(0)}
                        </span>
                        <div>
                          <p className="font-bold text-white">{c.name}</p>
                          <p className="text-xs text-slate-500">{c.city}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-400">{c.owner_name ?? "—"}</td>
                    <td className="px-3 py-3"><PlanPill label={PLANS[c.plan].label} color={PLANS[c.plan].color} /></td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1.5 text-slate-300">
                        <Users size={13} className="text-amber-400/60" />
                        <span className="font-bold text-white">{c.seats_used}</span>
                        <span className="text-slate-600">/ {c.seats_total}</span>
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-400">{c.patients_count}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS_STYLES[c.subscription_status]}`}>
                        {SUBSCRIPTION_STATUS_LABELS[c.subscription_status]}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-bold text-emerald-400">{fmtMoney(c.monthly_fee)}</td>
                    <td className="px-3 py-3 text-xs text-slate-500">{fmtDate(c.created_at)}</td>
                    <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant={c.subscription_status === "suspended" ? "primary" : "danger"}
                        onClick={() => toggleActive(c)}
                      >
                        {c.subscription_status === "suspended" ? <><Power size={13} /> تفعيل</> : <><PowerOff size={13} /> إيقاف</>}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {selected && (
        <ClinicDrawer
          clinic={selected}
          onClose={() => setSelected(null)}
          onToggle={() => toggleActive(selected)}
          onChangePlan={(p) => changePlan(selected, p)}
          onSetSeats={(n) => setSeats(selected, n)}
        />
      )}

      {adding && <AddClinicModal onClose={() => setAdding(false)} onCreated={reload} />}
    </div>
  );
}

function ClinicDrawer({
  clinic, onClose, onToggle, onChangePlan, onSetSeats,
}: {
  clinic: Clinic;
  onClose: () => void;
  onToggle: () => void;
  onChangePlan: (p: PlanTier) => void;
  onSetSeats: (n: number) => void;
}) {
  const trialDays = daysUntil(clinic.trial_ends_at);
  const seatsFree = clinic.seats_total - clinic.seats_used;
  return (
    <div className="fixed inset-0 z-[80] flex">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <aside className="relative ml-auto flex h-full w-full max-w-md flex-col overflow-y-auto border-r border-amber-500/10 bg-[#0d1117] p-6 shadow-2xl">
        <button onClick={onClose} className="absolute left-5 top-5 text-slate-500 hover:text-white"><X size={22} /></button>

        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-xl font-black text-slate-900">
            {clinic.name.replace(/^عيادة |^مركز /, "").charAt(0)}
          </span>
          <div>
            <h3 className="text-lg font-black text-white">{clinic.name}</h3>
            <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS_STYLES[clinic.subscription_status]}`}>
              {SUBSCRIPTION_STATUS_LABELS[clinic.subscription_status]}
            </span>
          </div>
        </div>

        <div className="mb-5 space-y-2 rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-sm">
          <Row icon={UserCog} label="المالك" value={clinic.owner_name ?? "—"} />
          <Row icon={MapPin} label="المدينة" value={clinic.city ?? "—"} />
          <Row icon={Phone} label="الهاتف" value={clinic.phone ?? "—"} ltr />
          <Row icon={Mail} label="البريد" value={clinic.email ?? "—"} ltr />
        </div>

        <div className="mb-5 grid grid-cols-3 gap-3">
          <Metric icon={Users} label="مرضى" value={clinic.patients_count} />
          <Metric icon={UserCog} label="موظفين" value={clinic.staff_count} />
          <Metric icon={CalendarCheck} label="مواعيد/شهر" value={clinic.appointments_30d} />
        </div>

        <div className="mb-5 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-bold text-white"><CreditCard size={16} className="text-amber-400" /> الباقة والفوترة</span>
            <span className="font-black text-emerald-400">{fmtMoney(clinic.monthly_fee)}<span className="text-xs text-slate-500">/شهر</span></span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(PLANS) as PlanTier[]).map((p) => (
              <button
                key={p}
                onClick={() => onChangePlan(p)}
                className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                  clinic.plan === p
                    ? "border-transparent text-slate-900"
                    : "border-white/10 text-slate-300 hover:bg-white/5"
                }`}
                style={clinic.plan === p ? { background: PLANS[p].color } : undefined}
              >
                {PLANS[p].label} · {PLANS[p].price}₪
              </button>
            ))}
          </div>
          <div className="mt-3 space-y-1 border-t border-white/5 pt-3 text-xs text-slate-500">
            {clinic.subscription_status === "trialing" && trialDays !== null && (
              <p>تنتهي التجربة خلال <span className="font-bold text-cyan-400">{trialDays} يوم</span></p>
            )}
            <p>الفوترة القادمة: <span className="text-slate-300">{fmtDate(clinic.next_billing_date)}</span></p>
            <p>آخر نشاط: <span className="text-slate-300">{fmtDate(clinic.last_active_at)}</span></p>
          </div>
        </div>

        <div className="mb-5 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-bold text-white"><Users size={16} className="text-amber-400" /> حسابات المستخدمين (المقاعد)</span>
            <span className="text-xs text-slate-400"><span className="font-black text-white">{clinic.seats_used}</span> مستخدم من {clinic.seats_total}</span>
          </div>
          <ProgressBar value={clinic.seats_used} max={clinic.seats_total || 1} color="#f59e0b" dark />
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-slate-500">{seatsFree} مقعد متاح للعيادة</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSetSeats(clinic.seats_total - 1)}
                disabled={clinic.seats_total <= clinic.seats_used}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 text-slate-300 transition hover:bg-white/5 disabled:opacity-30"
              >
                <Minus size={15} />
              </button>
              <span className="w-8 text-center font-black text-white">{clinic.seats_total}</span>
              <button
                onClick={() => onSetSeats(clinic.seats_total + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-slate-900 transition hover:bg-amber-400"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>
          <button
            onClick={() => onSetSeats(clinic.seats_total + 5)}
            className="mt-3 w-full rounded-xl border border-amber-500/20 bg-amber-500/10 py-2 text-xs font-bold text-amber-400 transition hover:bg-amber-500/20"
          >
            بيع 5 مقاعد إضافية (+{fmtMoney(5 * SEAT_PRICE)}/شهر)
          </button>
        </div>

        <div className="mt-auto flex gap-3 pt-4">
          <Button
            variant={clinic.subscription_status === "suspended" ? "primary" : "danger"}
            onClick={onToggle}
            className="flex-1"
          >
            {clinic.subscription_status === "suspended" ? "تفعيل الاشتراك" : "إيقاف الاشتراك"}
          </Button>
        </div>
      </aside>
    </div>
  );
}

function Row({ icon: Icon, label, value, ltr }: { icon: typeof MapPin; label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-slate-500"><Icon size={14} /> {label}</span>
      <span className="font-semibold text-slate-200" dir={ltr ? "ltr" : undefined}>{value}</span>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3 text-center">
      <Icon size={16} className="mx-auto mb-1 text-amber-400/70" />
      <p className="text-lg font-black text-white">{value}</p>
      <p className="text-[10px] text-slate-500">{label}</p>
    </div>
  );
}

function genPassword() {
  return "Asn" + Math.random().toString(36).slice(2, 8) + Math.floor(10 + Math.random() * 89);
}

function AddClinicModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [owner, setOwner] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(genPassword());
  const [plan, setPlan] = useState<PlanTier>("basic");
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const submit = async () => {
    if (!name.trim()) { toast.error("أدخل اسم العيادة"); return; }
    if (!email.trim()) { toast.error("أدخل بريد حساب المالك"); return; }
    if (!password.trim()) { toast.error("أدخل كلمة المرور"); return; }
    setSaving(true);

    const supabase = createClient();
    const clinicId = uid("clinic");
    const ownerUserId = uid("user");
    const status: SubscriptionStatus = plan === "trial" ? "trialing" : "active";
    const ownerEmail = email.trim().toLowerCase();

    await supabase.from("clinics").insert({
      id: clinicId, name: name.trim(), city: city.trim() || null, owner_name: owner.trim() || null,
      email: ownerEmail, phone: null, address: city.trim() || null,
      owner_id: ownerUserId, is_active: true, logo_url: null,
      plan, subscription_status: status, monthly_fee: PLANS[plan].price,
      next_billing_date: status === "active" ? new Date(Date.now() + 30 * 864e5).toISOString() : null,
      trial_ends_at: status === "trialing" ? new Date(Date.now() + 14 * 864e5).toISOString() : null,
      patients_count: 0, staff_count: 1, appointments_30d: 0, last_active_at: new Date().toISOString(),
      seats_total: PLANS[plan].seats, seats_used: 1,
    });
    await supabase.from("profiles").insert({
      id: ownerUserId, full_name: owner.trim() || "مالك العيادة", phone: null, avatar_url: null,
      is_super_admin: false, created_at: new Date().toISOString(),
    });
    await supabase.from("clinic_members").insert({
      id: uid("member"), clinic_id: clinicId, user_id: ownerUserId, role: "owner", is_active: true,
    });
    await supabase.from("credentials").insert({ email: ownerEmail, password: password.trim(), userId: ownerUserId });

    toast.success("تم إنشاء العيادة وحساب المالك");
    setSaving(false);
    setCreated({ email: ownerEmail, password: password.trim() });
    onCreated();
  };

  const copyCreds = () => {
    if (!created) return;
    navigator.clipboard?.writeText(`بوابة العيادة: ${window.location.origin}/login\nالبريد: ${created.email}\nكلمة المرور: ${created.password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-3xl border border-amber-500/10 bg-[#0d1117] p-6 shadow-2xl">
        <button onClick={onClose} className="absolute left-5 top-5 text-slate-500 hover:text-white"><X size={20} /></button>

        {created ? (
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400"><Check size={24} /></div>
            <h3 className="text-lg font-black text-white">تم تفعيل الحساب</h3>
            <p className="mt-1 text-sm text-slate-400">سلّم بيانات الدخول التالية لمالك العيادة:</p>
            <div className="mt-4 space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm">
              <div className="flex items-center justify-between"><span className="text-slate-500">الرابط</span><span className="text-slate-200" dir="ltr">/login</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-500">البريد</span><span className="font-bold text-white" dir="ltr">{created.email}</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-500">كلمة المرور</span><span className="font-bold text-amber-400" dir="ltr">{created.password}</span></div>
            </div>
            <button onClick={copyCreds} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 py-2.5 text-sm font-bold text-slate-200 transition hover:bg-white/5">
              {copied ? <><Check size={16} /> تم النسخ</> : <><Copy size={16} /> نسخ بيانات الدخول</>}
            </button>
            <Button variant="gold" onClick={onClose} className="mt-3 w-full">تم</Button>
          </div>
        ) : (
          <>
            <h3 className="mb-1 text-lg font-black text-white">عيادة جديدة + حساب مستخدم</h3>
            <p className="mb-5 text-xs text-slate-500">يتم إنشاء العيادة وحساب المالك الذي يدخل عبر بوابة العيادة</p>
            <div className="space-y-3">
              <Field label="اسم العيادة"><input value={name} onChange={(e) => setName(e.target.value)} className="admin-input" placeholder="عيادة النور لطب الأسنان" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="المدينة"><input value={city} onChange={(e) => setCity(e.target.value)} className="admin-input" /></Field>
                <Field label="اسم المالك"><input value={owner} onChange={(e) => setOwner(e.target.value)} className="admin-input" /></Field>
              </div>
              <Field label="بريد حساب المالك"><input value={email} onChange={(e) => setEmail(e.target.value)} className="admin-input" dir="ltr" placeholder="owner@clinic.com" /></Field>
              <Field label="كلمة المرور">
                <div className="flex gap-2">
                  <input value={password} onChange={(e) => setPassword(e.target.value)} className="admin-input flex-1" dir="ltr" />
                  <button onClick={() => setPassword(genPassword())} className="flex items-center gap-1 rounded-2xl border border-white/10 px-3 text-xs font-bold text-amber-400 hover:bg-white/5"><KeyRound size={14} /> توليد</button>
                </div>
              </Field>
              <Field label="الباقة">
                <select value={plan} onChange={(e) => setPlan(e.target.value as PlanTier)} className="admin-input">
                  {(Object.keys(PLANS) as PlanTier[]).map((p) => (
                    <option key={p} value={p}>{PLANS[p].label} — {PLANS[p].price}₪/شهر · {PLANS[p].seats} مقاعد</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="ghost" onClick={onClose} className="flex-1">إلغاء</Button>
              <Button variant="gold" onClick={submit} loading={saving} className="flex-1">إنشاء وتفعيل</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-slate-400">{label}</span>
      {children}
    </label>
  );
}
