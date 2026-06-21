import type {
  Appointment, Clinic, ClinicMember, Invoice, InvoiceItem,
  Patient, Procedure, Profile, Treatment, ToothRecord, Payment,
  Prescription, PlanTier, SubscriptionStatus,
} from "@/lib/types/database";
import { PLANS } from "@/lib/types/database";

export const CLINIC_ID = "clinic-demo-001";
export const OWNER_ID = "user-owner-001";
export const DOCTOR_ID = "user-doctor-001";
/** Platform system manager — NOT tied to any clinic. Sells subscriptions/seats to clinics. */
export const ADMIN_ID = "user-admin-001";

export interface Credential {
  email: string;
  password: string;
  userId: string;
}

/** Clinic-portal accounts (owners, doctors, staff). */
export const MOCK_CREDENTIALS: Credential[] = [
  { email: "owner@asnany.ps", password: "ammarking123", userId: OWNER_ID },
  { email: "ammar.ammar@gmail.com", password: "ammarking123", userId: DOCTOR_ID },
];

/** Platform-admin accounts (system managers). Separate from any clinic. */
export const ADMIN_CREDENTIALS: Credential[] = [
  { email: "ammar.shtayeh@gmail.com", password: "ammarking123", userId: ADMIN_ID },
];

export const ADMIN_IDS = ADMIN_CREDENTIALS.map((c) => c.userId);

export function isAdminUser(userId: string | null | undefined): boolean {
  return !!userId && ADMIN_IDS.includes(userId);
}

function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

const now = new Date().toISOString();
const today = new Date().toISOString().slice(0, 10);

function createSeedDb() {
  const profiles: Profile[] = [
    {
      id: ADMIN_ID,
      full_name: "عمار شتية — مدير النظام",
      phone: "0599000000",
      avatar_url: null,
      is_super_admin: true,
      created_at: now,
    },
    {
      id: OWNER_ID,
      full_name: "د. مالك العيادة",
      phone: "0599123456",
      avatar_url: null,
      is_super_admin: false,
      created_at: now,
    },
    {
      id: DOCTOR_ID,
      full_name: "د. عمار",
      phone: "0599765432",
      avatar_url: null,
      is_super_admin: false,
      created_at: now,
    },
  ];

  const mkClinic = (
    id: string,
    name: string,
    city: string,
    ownerName: string,
    plan: PlanTier,
    status: SubscriptionStatus,
    createdDaysAgo: number,
    patients_count: number,
    staff_count: number,
    appointments_30d: number,
    lastActiveDaysAgo: number,
  ): Clinic => ({
    id,
    name,
    phone: "02-29" + Math.floor(10000 + Math.random() * 89999),
    email: `${id}@asnany.ps`,
    address: `${city} — فلسطين`,
    city,
    owner_id: id === CLINIC_ID ? OWNER_ID : `owner-${id}`,
    owner_name: ownerName,
    is_active: status !== "suspended" && status !== "cancelled",
    logo_url: null,
    created_at: daysFromNow(-createdDaysAgo),
    plan,
    subscription_status: status,
    monthly_fee: PLANS[plan].price,
    next_billing_date: status === "active" || status === "past_due" ? daysFromNow(30 - (createdDaysAgo % 30)) : null,
    trial_ends_at: status === "trialing" ? daysFromNow(14 - createdDaysAgo) : null,
    patients_count,
    staff_count,
    appointments_30d,
    last_active_at: daysFromNow(-lastActiveDaysAgo),
    seats_total: PLANS[plan].seats,
    seats_used: Math.min(staff_count, PLANS[plan].seats),
  });

  const clinics: Clinic[] = [
    mkClinic(CLINIC_ID, "عيادة Asnany Demo", "رام الله", "د. مالك العيادة", "pro", "active", 220, 4, 4, 86, 0),
    mkClinic("clinic-002", "مركز الابتسامة لطب الأسنان", "نابلس", "د. ريم حدّاد", "enterprise", "active", 540, 12, 9, 240, 0),
    mkClinic("clinic-003", "عيادة الدكتور سامي للأسنان", "الخليل", "د. سامي قواسمة", "basic", "active", 95, 2, 2, 41, 1),
    mkClinic("clinic-004", "بيرفكت دينتال كلينك", "بيت لحم", "د. لينا عيسى", "pro", "past_due", 310, 6, 5, 120, 3),
    mkClinic("clinic-005", "عيادة النخبة لطب وتجميل الأسنان", "غزة", "د. أحمد مصلح", "enterprise", "active", 700, 18, 14, 360, 0),
    mkClinic("clinic-006", "سمايل كير", "جنين", "د. هبة زيدان", "trial", "trialing", 5, 1, 1, 9, 0),
    mkClinic("clinic-007", "عيادة الواحة لطب الأسنان", "طولكرم", "د. محمود سعيد", "basic", "suspended", 180, 1, 2, 0, 25),
    mkClinic("clinic-008", "رويال دينتال سنتر", "القدس", "د. تالا نمر", "pro", "active", 150, 7, 6, 175, 0),
  ];

  const clinic_members: ClinicMember[] = [
    { id: "member-001", clinic_id: CLINIC_ID, user_id: OWNER_ID, role: "owner", is_active: true },
    { id: "member-002", clinic_id: CLINIC_ID, user_id: DOCTOR_ID, role: "doctor", is_active: true },
  ];

  const patients: Patient[] = [
    { id: "patient-001", clinic_id: CLINIC_ID, file_number: "0001", full_name: "محمد أحمد", phone: "0599111111", email: null, date_of_birth: "1990-05-15", gender: "male", address: "رام الله", medical_notes: null, allergies: "بنسلين", is_active: true, created_at: now },
    { id: "patient-002", clinic_id: CLINIC_ID, file_number: "0002", full_name: "سارة خالد", phone: "0599222222", email: null, date_of_birth: "1985-08-20", gender: "female", address: "نابلس", medical_notes: "ضغط دم", allergies: null, is_active: true, created_at: now },
    { id: "patient-003", clinic_id: CLINIC_ID, file_number: "0003", full_name: "يوسف محمود", phone: "0599333333", email: null, date_of_birth: "2000-01-10", gender: "male", address: "الخليل", medical_notes: null, allergies: null, is_active: true, created_at: now },
    { id: "patient-004", clinic_id: CLINIC_ID, file_number: "0004", full_name: "ليلى عمر", phone: "0599444444", email: null, date_of_birth: "1995-12-03", gender: "female", address: "بيت لحم", medical_notes: null, allergies: "لاكتوز", is_active: true, created_at: now },
  ];

  const procedures: Procedure[] = [
    { id: "proc-001", clinic_id: CLINIC_ID, name_ar: "فحص عام", name_en: "Checkup", price: 50, duration_minutes: 30, is_active: true },
    { id: "proc-002", clinic_id: CLINIC_ID, name_ar: "تنظيف أسنان", name_en: "Cleaning", price: 100, duration_minutes: 45, is_active: true },
    { id: "proc-003", clinic_id: CLINIC_ID, name_ar: "حشوة", name_en: "Filling", price: 150, duration_minutes: 60, is_active: true },
    { id: "proc-004", clinic_id: CLINIC_ID, name_ar: "خلع سن", name_en: "Extraction", price: 200, duration_minutes: 45, is_active: true },
    { id: "proc-005", clinic_id: CLINIC_ID, name_ar: "علاج عصب", name_en: "Root Canal", price: 500, duration_minutes: 90, is_active: true },
  ];

  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  const appointments: Appointment[] = [
    { id: "apt-001", clinic_id: CLINIC_ID, patient_id: "patient-001", doctor_id: DOCTOR_ID, appointment_date: today, start_time: "09:00:00", end_time: "09:30:00", status: "confirmed", notes: null },
    { id: "apt-002", clinic_id: CLINIC_ID, patient_id: "patient-002", doctor_id: DOCTOR_ID, appointment_date: today, start_time: "10:00:00", end_time: "10:45:00", status: "scheduled", notes: "تنظيف" },
    { id: "apt-003", clinic_id: CLINIC_ID, patient_id: "patient-003", doctor_id: DOCTOR_ID, appointment_date: tomorrowStr, start_time: "11:00:00", end_time: null, status: "scheduled", notes: null },
  ];

  const treatments: Treatment[] = [
    { id: "treat-001", clinic_id: CLINIC_ID, patient_id: "patient-001", procedure_id: "proc-003", doctor_id: DOCTOR_ID, appointment_id: null, tooth_number: 16, description: null, status: "completed", treatment_date: "2026-06-01", cost: 150, notes: null },
    { id: "treat-002", clinic_id: CLINIC_ID, patient_id: "patient-002", procedure_id: "proc-005", doctor_id: DOCTOR_ID, appointment_id: null, tooth_number: 26, description: null, status: "planned", treatment_date: today, cost: 500, notes: "جلسة أولى" },
  ];

  const invoices: Invoice[] = [
    { id: "inv-001", clinic_id: CLINIC_ID, patient_id: "patient-001", invoice_number: "2026-0001", subtotal: 150, discount: 0, total: 150, paid_amount: 150, status: "paid", notes: null, issued_at: now, created_at: now },
    { id: "inv-002", clinic_id: CLINIC_ID, patient_id: "patient-002", invoice_number: "2026-0002", subtotal: 500, discount: 50, total: 450, paid_amount: 200, status: "partial", notes: null, issued_at: now, created_at: now },
  ];

  const invoice_items: InvoiceItem[] = [
    { id: "item-001", invoice_id: "inv-001", description: "حشوة سن 16", quantity: 1, unit_price: 150, total: 150 },
    { id: "item-002", invoice_id: "inv-002", description: "علاج عصب", quantity: 1, unit_price: 500, total: 500 },
  ];

  const payments: Payment[] = [
    { id: "pay-001", invoice_id: "inv-001", amount: 150, method: "cash", reference: null, paid_at: now },
    { id: "pay-002", invoice_id: "inv-002", amount: 200, method: "card", reference: null, paid_at: now },
  ];

  const tooth_records: ToothRecord[] = [
    { id: "tooth-001", clinic_id: CLINIC_ID, patient_id: "patient-001", tooth_number: 16, condition: "filling", surfaces: "O,M", notes: "حشوة مركبة — 2025", recorded_at: now },
    { id: "tooth-002", clinic_id: CLINIC_ID, patient_id: "patient-001", tooth_number: 26, condition: "healthy", surfaces: null, notes: null, recorded_at: now },
    { id: "tooth-003", clinic_id: CLINIC_ID, patient_id: "patient-001", tooth_number: 36, condition: "cavity", surfaces: "O,D", notes: "تسوس سطح إطباقي", recorded_at: now },
    { id: "tooth-004", clinic_id: CLINIC_ID, patient_id: "patient-001", tooth_number: 46, condition: "root_canal", surfaces: null, notes: "علاج عصب — جلسة 2", recorded_at: now },
    { id: "tooth-005", clinic_id: CLINIC_ID, patient_id: "patient-001", tooth_number: 11, condition: "crown", surfaces: null, notes: "تاج زيركون", recorded_at: now },
    { id: "tooth-006", clinic_id: CLINIC_ID, patient_id: "patient-002", tooth_number: 26, condition: "root_canal", surfaces: "O", notes: "جلسة أولى", recorded_at: now },
    { id: "tooth-007", clinic_id: CLINIC_ID, patient_id: "patient-002", tooth_number: 38, condition: "missing", surfaces: null, notes: "مخلوع سابقاً", recorded_at: now },
  ];

  const prescriptions: Prescription[] = [
    {
      id: "rx-001", clinic_id: CLINIC_ID, patient_id: "patient-001", doctor_id: DOCTOR_ID,
      diagnosis: "التهاب لثة حاد", notes: "مضمضة بماء وملح مرتين يومياً", issued_at: now,
      items: [
        { drug: "Amoxicillin 500mg", dose: "حبة", frequency: "كل 8 ساعات", duration: "5 أيام" },
        { drug: "Ibuprofen 400mg", dose: "حبة", frequency: "عند الألم", duration: "3 أيام" },
      ],
    },
    {
      id: "rx-002", clinic_id: CLINIC_ID, patient_id: "patient-002", doctor_id: DOCTOR_ID,
      diagnosis: "ما بعد علاج العصب", notes: "تجنب المضغ على السن المعالج", issued_at: now,
      items: [
        { drug: "Augmentin 1g", dose: "حبة", frequency: "كل 12 ساعة", duration: "7 أيام" },
        { drug: "Paracetamol 1g", dose: "حبة", frequency: "كل 8 ساعات", duration: "3 أيام" },
      ],
    },
  ];

  return {
    profiles, clinics, clinic_members, patients, procedures,
    appointments, treatments, invoices, invoice_items, payments,
    tooth_records, prescriptions, audit_logs: [] as Record<string, unknown>[],
    credentials: [] as Credential[],
    sessionUserId: null as string | null,
  };
}

export type MockDb = ReturnType<typeof createSeedDb>;

const STORAGE_KEY = "asnany_mock_db_v3";

export function loadDb(): MockDb {
  if (typeof window === "undefined") return createSeedDb();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = createSeedDb();
      saveDb(seed);
      return seed;
    }
    return { ...createSeedDb(), ...JSON.parse(raw) } as MockDb;
  } catch {
    return createSeedDb();
  }
}

export function saveDb(db: MockDb) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function resetDb() {
  const seed = createSeedDb();
  saveDb(seed);
  return seed;
}

export function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Find a clinic credential among static seed + dynamically provisioned (DB) accounts. */
export function findClinicCredential(email: string, password: string): Credential | null {
  const stat = MOCK_CREDENTIALS.find((c) => c.email === email && c.password === password);
  if (stat) return stat;
  const db = loadDb();
  return db.credentials.find((c) => c.email === email && c.password === password) ?? null;
}

export function findCredentialByUserId(userId: string): Credential | null {
  const all = [...MOCK_CREDENTIALS, ...ADMIN_CREDENTIALS];
  const stat = all.find((c) => c.userId === userId);
  if (stat) return stat;
  const db = loadDb();
  return db.credentials.find((c) => c.userId === userId) ?? null;
}
