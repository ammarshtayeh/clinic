import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { isMockMode } from "@/lib/mock/config";
import {
  Stethoscope, Shield, ArrowLeft, Sparkles, Users, CalendarCheck,
  Smile, Pill, FileText, BarChart3, ShieldCheck, Zap, Clock,
} from "lucide-react";

const FEATURES = [
  { icon: Users, title: "ملفات المرضى", desc: "أرشيف طبي كامل، حساسيات، وتاريخ علاجي" },
  { icon: CalendarCheck, title: "المواعيد والتقويم", desc: "جدولة ذكية مع تذكير وحالات المواعيد" },
  { icon: Smile, title: "المخطط السني FDI", desc: "مخطط أسنان احترافي بترقيم عالمي" },
  { icon: Pill, title: "الوصفات الطبية", desc: "إصدار وطباعة الوصفات بضغطة زر" },
  { icon: FileText, title: "الفواتير والمدفوعات", desc: "فوترة دقيقة وتتبع المستحقات" },
  { icon: BarChart3, title: "تقارير وتحليلات", desc: "لوحات أداء ورؤى مالية فورية" },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060d18]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 text-xl font-black text-white shadow-lg shadow-cyan-500/30">
            A
          </div>
          <div>
            <p className="text-xl font-black text-white">{BRAND.name}</p>
            <p className="text-xs text-slate-500">{BRAND.domain}</p>
          </div>
        </div>
        {isMockMode() && (
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
            وضع تجريبي · Mock
          </span>
        )}
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-6 pb-16 pt-8 md:pt-16">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-cyan-300">
            <Sparkles size={14} />
            {BRAND.tagline}
          </div>
          <h1 className="text-3xl font-black leading-tight text-white md:text-5xl">
            نظام واحد.<br />
            <span className="bg-gradient-to-l from-cyan-400 to-cyan-200 bg-clip-text text-transparent">
              بوابتان احترافيتان.
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">{BRAND.description}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Clinic Portal */}
          <Link
            href="/login"
            className="group relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-900 to-slate-800 p-8 transition hover:border-cyan-400/40 hover:shadow-2xl hover:shadow-cyan-500/10"
          >
            <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-cyan-500/10 blur-2xl transition group-hover:bg-cyan-500/20" />
            <div className="relative">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 text-white shadow-lg">
                <Stethoscope size={28} />
              </div>
              <h2 className="text-2xl font-black text-white">{BRAND.clinicPortal.title}</h2>
              <p className="mt-2 text-sm text-slate-400">{BRAND.clinicPortal.subtitle}</p>
              <ul className="mt-6 space-y-2 text-sm text-slate-300">
                <li>• المرضى والمواعيد والمخطط السني</li>
                <li>• الفواتير والتقارير</li>
                <li>• للطبيب والاستقبال والمحاسبة</li>
              </ul>
              <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-cyan-400">
                دخول العيادة
                <ArrowLeft size={16} className="transition group-hover:-translate-x-1" />
              </span>
            </div>
          </Link>

          {/* Admin Portal */}
          <Link
            href="/admin/login"
            className="group relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-slate-900 to-[#1a1208] p-8 transition hover:border-amber-400/40 hover:shadow-2xl hover:shadow-amber-500/10"
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl transition group-hover:bg-amber-500/20" />
            <div className="relative">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 shadow-lg">
                <Shield size={28} />
              </div>
              <h2 className="text-2xl font-black text-white">{BRAND.adminPortal.title}</h2>
              <p className="mt-2 text-sm text-slate-400">{BRAND.adminPortal.subtitle}</p>
              <ul className="mt-6 space-y-2 text-sm text-slate-300">
                <li>• إدارة جميع العيادات</li>
                <li>• تفعيل وإيقاف الاشتراكات</li>
                <li>• Super Admin فقط</li>
              </ul>
              <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-amber-400">
                دخول المنصة
                <ArrowLeft size={16} className="transition group-hover:-translate-x-1" />
              </span>
            </div>
          </Link>
        </div>

        <div className="mt-20">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-black text-white md:text-3xl">كل ما تحتاجه عيادتك في مكان واحد</h2>
            <p className="mt-2 text-sm text-slate-400">منصة متكاملة صُممت خصيصاً لعيادات الأسنان</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 transition hover:border-cyan-400/30 hover:bg-white/[0.04]"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 transition group-hover:scale-110">
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-white">{title}</h3>
                <p className="mt-1 text-sm text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 grid gap-4 rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "آمن وموثوق", desc: "صلاحيات دقيقة لكل دور وحماية للبيانات" },
            { icon: Zap, title: "سريع وسلس", desc: "واجهة عربية حديثة تعمل على كل الأجهزة" },
            { icon: Clock, title: "يوفّر وقتك", desc: "أتمتة المهام اليومية وتقليل الأخطاء" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400"><Icon size={20} /></span>
              <div>
                <p className="font-bold text-white">{title}</p>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} {BRAND.name} · {BRAND.domain} · نظام SaaS لعيادات الأسنان
        </p>
      </main>
    </div>
  );
}
