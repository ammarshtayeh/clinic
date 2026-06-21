"use client";

import { useMemo } from "react";
import { PageHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/status-badge";
import { TableSkeleton } from "@/components/ui/dialog";
import { AdminCard } from "@/components/layout/admin-ui";
import { useClinics } from "@/lib/admin/use-clinics";
import { fmtDate } from "@/lib/admin/metrics";
import { PLANS } from "@/lib/types/database";
import type { Clinic } from "@/lib/types/database";
import {
  Building2, CreditCard, PowerOff, Clock, UserPlus, Wallet, type LucideIcon,
} from "lucide-react";

interface Event {
  id: string;
  icon: LucideIcon;
  color: string;
  title: string;
  meta: string;
  at: string;
}

function buildEvents(clinics: Clinic[]): Event[] {
  const events: Event[] = [];
  clinics.forEach((c) => {
    events.push({
      id: `${c.id}-signup`,
      icon: UserPlus,
      color: "#06b6d4",
      title: `انضمّت عيادة جديدة: ${c.name}`,
      meta: `${c.owner_name ?? "—"} · ${c.city} · باقة ${PLANS[c.plan].label}`,
      at: c.created_at,
    });
    if (c.subscription_status === "active" && c.plan !== "trial") {
      events.push({
        id: `${c.id}-pay`,
        icon: Wallet,
        color: "#10b981",
        title: `دفعة مستلمة من ${c.name}`,
        meta: `${PLANS[c.plan].price}₪ · باقة ${PLANS[c.plan].label}`,
        at: c.last_active_at ?? c.created_at,
      });
    }
    if (c.subscription_status === "past_due") {
      events.push({
        id: `${c.id}-due`,
        icon: CreditCard,
        color: "#f59e0b",
        title: `فشل تجديد اشتراك ${c.name}`,
        meta: `مستحق ${PLANS[c.plan].price}₪`,
        at: c.next_billing_date ?? c.created_at,
      });
    }
    if (c.subscription_status === "suspended") {
      events.push({
        id: `${c.id}-susp`,
        icon: PowerOff,
        color: "#f43f5e",
        title: `تم إيقاف اشتراك ${c.name}`,
        meta: `${c.city} · آخر نشاط ${fmtDate(c.last_active_at)}`,
        at: c.last_active_at ?? c.created_at,
      });
    }
  });
  return events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

export default function ActivityPage() {
  const { clinics, loading } = useClinics();
  const events = useMemo(() => buildEvents(clinics), [clinics]);

  return (
    <div>
      <PageHeader
        title="سجل النشاط"
        description="كل أحداث المنصة — اشتراكات، مدفوعات، وتغييرات الحالة"
        badge={<Badge variant="gold">{events.length} حدث</Badge>}
        dark
      />

      <AdminCard title="آخر الأحداث" icon={Clock}>
        {loading ? <TableSkeleton /> : (
          <div className="relative space-y-1">
            <span className="absolute bottom-2 right-[19px] top-2 w-px bg-white/5" />
            {events.map((e) => {
              const Icon = e.icon;
              return (
                <div key={e.id} className="relative flex items-start gap-4 rounded-2xl px-2 py-3 transition hover:bg-white/[0.02]">
                  <span
                    className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-[#0a0f18]"
                    style={{ background: `${e.color}22`, color: e.color }}
                  >
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white">{e.title}</p>
                    <p className="text-xs text-slate-500">{e.meta}</p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-600">{fmtDate(e.at)}</span>
                </div>
              );
            })}
          </div>
        )}
      </AdminCard>

      <p className="mt-4 flex items-center gap-2 text-xs text-slate-600">
        <Building2 size={13} /> يعكس هذا السجل بيانات تجريبية، وسيُربط بسجل التدقيق الفعلي عند تفعيل قاعدة البيانات.
      </p>
    </div>
  );
}
