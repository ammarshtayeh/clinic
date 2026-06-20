import {
  AppointmentStatus,
  ChairStatus,
  InvoiceStatus,
  Role,
  ToothCondition,
  TreatmentPlanPriority,
  TreatmentPlanStatus,
} from "@/lib/types";
import { AppLang } from "@/lib/i18n";

const roleLabelsByLang: Record<AppLang, Record<Role, string>> = {
  ar: {
    admin: "مدير النظام",
    branchManager: "مدير الفرع",
    doctor: "طبيب",
    receptionist: "الاستقبال",
    accountant: "المحاسب",
  },
  he: {
    admin: "מנהל מערכת",
    branchManager: "מנהל סניף",
    doctor: "רופא",
    receptionist: "קבלה",
    accountant: "חשבונאי",
  },
};

const appointmentStatusLabelsByLang: Record<AppLang, Record<AppointmentStatus, string>> = {
  ar: {
    Scheduled: "مجدول",
    Confirmed: "مؤكد",
    "Checked-In": "تم تسجيل الوصول",
    "In Clinic": "داخل العيادة",
    Completed: "مكتمل",
    Cancelled: "ملغي",
    "No-Show": "لم يحضر",
  },
  he: {
    Scheduled: "מתוזמן",
    Confirmed: "מאושר",
    "Checked-In": "בוצע צ׳ק-אין",
    "In Clinic": "במרפאה",
    Completed: "הושלם",
    Cancelled: "בוטל",
    "No-Show": "לא הגיע",
  },
};

const chairStatusLabelsByLang: Record<AppLang, Record<ChairStatus, string>> = {
  ar: {
    Available: "متاح",
    Occupied: "مشغول",
    Reserved: "محجوز",
    "Out of Service": "خارج الخدمة",
  },
  he: {
    Available: "זמין",
    Occupied: "תפוס",
    Reserved: "שמור",
    "Out of Service": "מחוץ לשירות",
  },
};

const toothConditionLabelsByLang: Record<AppLang, Record<ToothCondition, string>> = {
  ar: {
    Healthy: "سليم",
    Cavity: "تسوس",
    Filling: "حشوة",
    Crown: "تاج",
    Bridge: "جسر",
    "Root Canal": "علاج عصب",
    Extraction: "خلع",
    Extracted: "مخلوع",
    Implant: "زرعة",
    Missing: "مفقود",
    Fractured: "مكسور",
  },
  he: {
    Healthy: "תקינה",
    Cavity: "עששת",
    Filling: "סתימה",
    Crown: "כתר",
    Bridge: "גשר",
    "Root Canal": "טיפול שורש",
    Extraction: "עקירה",
    Extracted: "נעקרה",
    Implant: "שתל",
    Missing: "חסרה",
    Fractured: "שבורה",
  },
};

const appointmentViewLabelsByLang = {
  ar: {
    Calendar: "تقويم",
    Daily: "يومي",
    Chair: "حسب الكرسي",
  },
  he: {
    Calendar: "לוח שנה",
    Daily: "יומי",
    Chair: "לפי כיסא",
  },
} as const;

const treatmentPlanPriorityLabelsByLang: Record<AppLang, Record<TreatmentPlanPriority, string>> = {
  ar: {
    High: "عالية",
    Medium: "متوسطة",
    Low: "منخفضة",
  },
  he: {
    High: "גבוהה",
    Medium: "בינונית",
    Low: "נמוכה",
  },
};

const treatmentPlanStatusLabelsByLang: Record<AppLang, Record<TreatmentPlanStatus, string>> = {
  ar: {
    Pending: "قيد الانتظار",
    Scheduled: "مجدولة",
    Completed: "مكتملة",
    Cancelled: "ملغية",
  },
  he: {
    Pending: "ממתינה",
    Scheduled: "מתוזמנת",
    Completed: "הושלמה",
    Cancelled: "בוטלה",
  },
};

const invoiceStatusLabelsByLang: Record<AppLang, Record<InvoiceStatus, string>> = {
  ar: {
    Draft: "مسودة",
    "Partially Paid": "مدفوعة جزئيا",
    Paid: "مدفوعة",
    Cancelled: "ملغاة",
  },
  he: {
    Draft: "טיוטה",
    "Partially Paid": "שולמה חלקית",
    Paid: "שולמה",
    Cancelled: "בוטלה",
  },
};

// Back-compat exports (some pages import these constants).
export const roleLabels = roleLabelsByLang.ar;
export const appointmentStatusLabels = appointmentStatusLabelsByLang.ar;
export const chairStatusLabels = chairStatusLabelsByLang.ar;
export const toothConditionLabels = toothConditionLabelsByLang.ar;
export const appointmentViewLabels = appointmentViewLabelsByLang.ar;
export const treatmentPlanPriorityLabels = treatmentPlanPriorityLabelsByLang.ar;
export const treatmentPlanStatusLabels = treatmentPlanStatusLabelsByLang.ar;
export const invoiceStatusLabels = invoiceStatusLabelsByLang.ar;

export const getRoleLabel = (role: Role, lang: AppLang) => roleLabelsByLang[lang][role];
export const getAppointmentStatusLabel = (status: AppointmentStatus, lang: AppLang) =>
  appointmentStatusLabelsByLang[lang][status];
export const getChairStatusLabel = (status: ChairStatus, lang: AppLang) => chairStatusLabelsByLang[lang][status];
export const getToothConditionLabel = (condition: ToothCondition, lang: AppLang) =>
  toothConditionLabelsByLang[lang][condition];
export const getAppointmentViewLabel = (
  view: keyof typeof appointmentViewLabelsByLang.ar,
  lang: AppLang,
) => appointmentViewLabelsByLang[lang][view];
export const getTreatmentPlanPriorityLabel = (priority: TreatmentPlanPriority, lang: AppLang) =>
  treatmentPlanPriorityLabelsByLang[lang][priority];
export const getTreatmentPlanStatusLabel = (status: TreatmentPlanStatus, lang: AppLang) =>
  treatmentPlanStatusLabelsByLang[lang][status];
export const getInvoiceStatusLabel = (status: InvoiceStatus, lang: AppLang) =>
  invoiceStatusLabelsByLang[lang][status];

