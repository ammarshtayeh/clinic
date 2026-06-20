export type MemberRole = "owner" | "doctor" | "receptionist" | "accountant";
export type AppointmentStatus = "scheduled" | "confirmed" | "checked_in" | "in_progress" | "completed" | "cancelled" | "no_show";
export type TreatmentStatus = "planned" | "in_progress" | "completed" | "cancelled";
export type InvoiceStatus = "draft" | "issued" | "paid" | "partial" | "void";
export type PaymentMethod = "cash" | "card" | "transfer" | "insurance" | "other";
export type ToothCondition = "healthy" | "cavity" | "filling" | "crown" | "root_canal" | "extraction" | "implant" | "missing" | "other";

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  is_super_admin: boolean;
  created_at: string;
}

export interface Clinic {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  owner_id: string;
  is_active: boolean;
  logo_url: string | null;
  created_at: string;
}

export interface ClinicMember {
  id: string;
  clinic_id: string;
  user_id: string;
  role: MemberRole;
  is_active: boolean;
  profile?: Profile;
}

export interface Patient {
  id: string;
  clinic_id: string;
  file_number: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  date_of_birth: string | null;
  gender: "male" | "female" | "other" | null;
  address: string | null;
  medical_notes: string | null;
  allergies: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  clinic_id: string;
  patient_id: string;
  doctor_id: string | null;
  appointment_date: string;
  start_time: string;
  end_time: string | null;
  status: AppointmentStatus;
  notes: string | null;
  patient?: Patient;
  doctor?: Profile;
}

export interface Procedure {
  id: string;
  clinic_id: string;
  name_ar: string;
  name_en: string | null;
  price: number;
  duration_minutes: number;
  is_active: boolean;
}

export interface Treatment {
  id: string;
  clinic_id: string;
  patient_id: string;
  procedure_id: string | null;
  doctor_id: string | null;
  appointment_id: string | null;
  tooth_number: number | null;
  description: string | null;
  status: TreatmentStatus;
  treatment_date: string;
  cost: number;
  notes: string | null;
  patient?: Patient;
  procedure?: Procedure;
  doctor?: Profile;
}

export interface Invoice {
  id: string;
  clinic_id: string;
  patient_id: string;
  invoice_number: string;
  subtotal: number;
  discount: number;
  total: number;
  paid_amount: number;
  status: InvoiceStatus;
  notes: string | null;
  issued_at: string | null;
  created_at: string;
  patient?: Patient;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  method: PaymentMethod;
  reference: string | null;
  paid_at: string;
}

export interface ToothRecord {
  id: string;
  clinic_id: string;
  patient_id: string;
  tooth_number: number;
  condition: ToothCondition;
  surfaces: string | null;
  notes: string | null;
  recorded_at: string;
}

export interface AuditLog {
  id: string;
  clinic_id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      clinics: { Row: Clinic; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      clinic_members: { Row: ClinicMember; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      patients: { Row: Patient; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      appointments: { Row: Appointment; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      procedures: { Row: Procedure; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      treatments: { Row: Treatment; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      invoices: { Row: Invoice; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      invoice_items: { Row: InvoiceItem; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      payments: { Row: Payment; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      tooth_records: { Row: ToothRecord; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      audit_logs: { Row: AuditLog; Insert: Record<string, unknown>; Update: Record<string, unknown> };
    };
    Functions: {
      generate_file_number: { Args: { p_clinic_id: string }; Returns: string };
      generate_invoice_number: { Args: { p_clinic_id: string }; Returns: string };
      seed_default_procedures: { Args: { p_clinic_id: string }; Returns: void };
    };
  };
}

export const ROLE_LABELS: Record<MemberRole, string> = {
  owner: "مالك العيادة",
  doctor: "طبيب",
  receptionist: "استقبال",
  accountant: "محاسب",
};

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: "مجدول",
  confirmed: "مؤكد",
  checked_in: "وصل",
  in_progress: "جاري",
  completed: "مكتمل",
  cancelled: "ملغي",
  no_show: "لم يحضر",
};

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "مسودة",
  issued: "صادرة",
  paid: "مدفوعة",
  partial: "جزئية",
  void: "ملغاة",
};

export const TOOTH_CONDITION_LABELS: Record<ToothCondition, string> = {
  healthy: "سليم",
  cavity: "تسوس",
  filling: "حشوة",
  crown: "تاج",
  root_canal: "علاج عصب",
  extraction: "خلع",
  implant: "زراعة",
  missing: "مفقود",
  other: "أخرى",
};

export const TOOTH_CONDITION_COLORS: Record<ToothCondition, string> = {
  healthy: "#22c55e",
  cavity: "#ef4444",
  filling: "#3b82f6",
  crown: "#a855f7",
  root_canal: "#f97316",
  extraction: "#6b7280",
  implant: "#06b6d4",
  missing: "#d1d5db",
  other: "#eab308",
};
