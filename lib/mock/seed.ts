import type {
  Appointment, Clinic, ClinicMember, Invoice, InvoiceItem,
  Patient, Procedure, Profile, Treatment, ToothRecord, Payment,
} from "@/lib/types/database";

export const CLINIC_ID = "clinic-demo-001";
export const OWNER_ID = "user-owner-001";
export const DOCTOR_ID = "user-doctor-001";

export const MOCK_CREDENTIALS = [
  { email: "ammar.shtayeh@gmail.com", password: "ammarking123", userId: OWNER_ID },
  { email: "ammar.ammar@gmail.com", password: "ammarking123", userId: DOCTOR_ID },
] as const;

const now = new Date().toISOString();
const today = new Date().toISOString().slice(0, 10);

function createSeedDb() {
  const profiles: Profile[] = [
    {
      id: OWNER_ID,
      full_name: "د. عمار شتية",
      phone: "0599123456",
      avatar_url: null,
      is_super_admin: true,
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

  const clinics: Clinic[] = [
    {
      id: CLINIC_ID,
      name: "عيادة Asnany Demo",
      phone: "02-2951234",
      email: "clinic@asnany.ps",
      address: "رام الله — شارع ركب",
      city: "رام الله",
      owner_id: OWNER_ID,
      is_active: true,
      logo_url: null,
      created_at: now,
    },
  ];

  const clinic_members: ClinicMember[] = [
    { id: "member-001", clinic_id: CLINIC_ID, user_id: OWNER_ID, role: "owner", is_active: true },
    { id: "member-002", clinic_id: CLINIC_ID, user_id: DOCTOR_ID, role: "doctor", is_active: true },
  ];

  const patients: Patient[] = [
    { id: "patient-001", clinic_id: CLINIC_ID, file_number: "0001", full_name: "محمد أحمد", phone: "0599111111", email: null, date_of_birth: "1990-05-15", gender: "male", address: "رام الله", medical_notes: null, allergies: "البenicillin", is_active: true, created_at: now },
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
    { id: "tooth-001", clinic_id: CLINIC_ID, patient_id: "patient-001", tooth_number: 16, condition: "filling", surfaces: null, notes: null, recorded_at: now },
    { id: "tooth-002", clinic_id: CLINIC_ID, patient_id: "patient-001", tooth_number: 26, condition: "healthy", surfaces: null, notes: null, recorded_at: now },
  ];

  return {
    profiles, clinics, clinic_members, patients, procedures,
    appointments, treatments, invoices, invoice_items, payments,
    tooth_records, audit_logs: [] as Record<string, unknown>[],
    sessionUserId: null as string | null,
  };
}

export type MockDb = ReturnType<typeof createSeedDb>;

const STORAGE_KEY = "asnany_mock_db_v1";

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
