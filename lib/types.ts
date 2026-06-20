export type Role = "admin" | "branchManager" | "doctor" | "receptionist" | "accountant";

export type Branch = {
  id: string;
  name: string;
  address: string;
  phone: string;
  status: "Active" | "Suspended";
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  branchIds: string[];
  active: boolean;
};

export type Patient = {
  id: string;
  fileNumber: string;
  fullName: string;
  phone: string;
  dateOfBirth: string;
  gender: "Male" | "Female";
  idNumber: string;
  medicalHistory: string;
  allergies: string;
  allergiesList?: PatientAllergy[];
  nextVisit: string;
};

export type PatientAllergy = {
  id: string;
  patientId: string;
  name: string;
  severity?: string;
};

export type PatientAttachment = {
  id: string;
  patientId: string;
  title: string;
  url: string;
  type: "X-Ray" | "Image" | "Document";
  uploadedAt: string;
};

export type AppointmentStatus =
  | "Scheduled"
  | "Confirmed"
  | "Checked-In"
  | "In Clinic"
  | "Completed"
  | "Cancelled"
  | "No-Show";

export type Appointment = {
  id: string;
  patientId: string;
  doctorId: string;
  branchId: string;
  chairId: string;
  dateTime: string;
  duration: number;
  status: AppointmentStatus;
  reason?: string;
};

export type Treatment = {
  id: string;
  nameAr: string;
  nameEn: string;
  category: string;
  basePrice: number;
  isActive: boolean;
  toothRelated: boolean;
};

export type ToothCondition =
  | "Healthy"
  | "Cavity"
  | "Filling"
  | "Crown"
  | "Bridge"
  | "Root Canal"
  | "Extraction"
  | "Extracted"
  | "Implant"
  | "Missing"
  | "Fractured";

export type ToothRecord = {
  tooth: number;
  condition: ToothCondition;
  treatment?: string;
  cost?: number;
};

export type ChairStatus = "Available" | "Occupied" | "Reserved" | "Out of Service";

export type Chair = {
  id: string;
  branchId: string;
  number: number;
  label?: string;
  status: ChairStatus;
};

export type Visit = {
  id: string;
  patientId: string;
  doctorId: string;
  branchId: string;
  chairId: string;
  appointmentId: string;
  startedAt: string;
  completedAt?: string;
  nextVisit?: string;
};

export type ProcedureStatus = "Planned" | "Completed";
export type TreatmentPlanPriority = "Low" | "Medium" | "High";
export type TreatmentPlanStatus = "Pending" | "Scheduled" | "Completed" | "Cancelled";

export type ToothProcedure = {
  id: string;
  patientId: string;
  visitId?: string;
  doctorId: string;
  branchId: string;
  tooth?: number;
  condition: ToothCondition;
  treatmentId: string;
  treatmentName: string;
  surfaces: string[];
  notes: string;
  status: ProcedureStatus;
  cost: number;
  date: string;
};

export type TreatmentPlan = {
  id: string;
  patientId: string;
  tooth?: number;
  procedureId: string;
  procedureName: string;
  priority: TreatmentPlanPriority;
  plannedFor?: string;
  status: TreatmentPlanStatus;
  notes: string;
  createdBy: string;
  branchId: string;
};

export type NextVisitStatus = "Pending" | "Scheduled" | "Completed" | "Cancelled";

export type NextVisit = {
  id: string;
  patientId: string;
  doctorId: string;
  branchId?: string;
  appointmentId?: string;
  treatmentPlanIds: string[];
  suggestedDate: string;
  status: NextVisitStatus;
};

export type AuditLog = {
  id: string;
  userId: string;
  action: string;
  tableName: string;
  recordId: string;
  timestamp: string;
  ipAddress: string;
};

export type BranchProcedurePrice = {
  id: string;
  branchId: string;
  treatmentId: string;
  price: number;
};

export type InvoiceLine = {
  id: string;
  procedureId: string;
  tooth?: number;
  treatmentName: string;
  amount: number;
  status: ProcedureStatus;
  date: string;
};

export type PaymentMethod = "Cash" | "Card" | "Insurance" | "Installment";

export type Payment = {
  id: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  notes?: string;
};

export type InvoiceStatus = "Draft" | "Partially Paid" | "Paid" | "Cancelled";

export type Invoice = {
  id: string;
  invoiceNumber: string;
  patientId: string;
  doctorId: string;
  branchId: string;
  visitId?: string;
  date: string;
  lines: InvoiceLine[];
  payments: Payment[];
  discount: number;
  discountReason?: string;
  insuranceCoverage: number;
  status: InvoiceStatus;
};
