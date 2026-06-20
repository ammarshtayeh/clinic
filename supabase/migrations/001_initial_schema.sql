-- نظام إدارة عيادات الأسنان - Supabase Schema
-- نفّذ هذا الملف في Supabase SQL Editor

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- الجداول الأساسية
-- ============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE member_role AS ENUM ('owner', 'doctor', 'receptionist', 'accountant');

CREATE TABLE clinic_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role member_role NOT NULL DEFAULT 'receptionist',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(clinic_id, user_id)
);

CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  file_number TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  address TEXT,
  medical_notes TEXT,
  allergies TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(clinic_id, file_number)
);

CREATE TYPE appointment_status AS ENUM (
  'scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show'
);

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  status appointment_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE procedures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration_minutes INT NOT NULL DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE treatment_status AS ENUM ('planned', 'in_progress', 'completed', 'cancelled');

CREATE TABLE treatments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  procedure_id UUID REFERENCES procedures(id) ON DELETE SET NULL,
  doctor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  tooth_number INT,
  description TEXT,
  status treatment_status NOT NULL DEFAULT 'planned',
  treatment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE invoice_status AS ENUM ('draft', 'issued', 'paid', 'partial', 'void');

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status invoice_status NOT NULL DEFAULT 'draft',
  notes TEXT,
  issued_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(clinic_id, invoice_number)
);

CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0
);

CREATE TYPE payment_method AS ENUM ('cash', 'card', 'transfer', 'insurance', 'other');

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  method payment_method NOT NULL DEFAULT 'cash',
  reference TEXT,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE tooth_condition AS ENUM (
  'healthy', 'cavity', 'filling', 'crown', 'root_canal', 'extraction', 'implant', 'missing', 'other'
);

CREATE TABLE tooth_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  tooth_number INT NOT NULL CHECK (tooth_number BETWEEN 11 AND 85),
  condition tooth_condition NOT NULL DEFAULT 'healthy',
  surfaces TEXT,
  notes TEXT,
  recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(clinic_id, patient_id, tooth_number)
);

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX idx_clinic_members_user ON clinic_members(user_id);
CREATE INDEX idx_clinic_members_clinic ON clinic_members(clinic_id);
CREATE INDEX idx_patients_clinic ON patients(clinic_id);
CREATE INDEX idx_appointments_clinic_date ON appointments(clinic_id, appointment_date);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_treatments_patient ON treatments(patient_id);
CREATE INDEX idx_invoices_clinic ON invoices(clinic_id);
CREATE INDEX idx_tooth_records_patient ON tooth_records(patient_id);

-- ============================================
-- Helper: التحقق من عضوية العيادة
-- ============================================

CREATE OR REPLACE FUNCTION is_clinic_member(p_clinic_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM clinic_members
    WHERE clinic_id = p_clinic_id
      AND user_id = auth.uid()
      AND is_active = TRUE
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_clinic_owner(p_clinic_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM clinic_members
    WHERE clinic_id = p_clinic_id
      AND user_id = auth.uid()
      AND role = 'owner'
      AND is_active = TRUE
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_user_clinic_ids()
RETURNS SETOF UUID AS $$
  SELECT clinic_id FROM clinic_members
  WHERE user_id = auth.uid() AND is_active = TRUE;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ============================================
-- Trigger: إنشاء ملف شخصي وعيادة عند التسجيل
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_clinic_id UUID;
  clinic_name_text TEXT;
  user_full_name TEXT;
BEGIN
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  clinic_name_text := NEW.raw_user_meta_data->>'clinic_name';

  INSERT INTO profiles (id, full_name, phone)
  VALUES (NEW.id, user_full_name, NEW.raw_user_meta_data->>'phone');

  IF clinic_name_text IS NOT NULL AND clinic_name_text <> '' THEN
    INSERT INTO clinics (name, owner_id, phone, email)
    VALUES (clinic_name_text, NEW.id, NEW.raw_user_meta_data->>'phone', NEW.email)
    RETURNING id INTO new_clinic_id;

    INSERT INTO clinic_members (clinic_id, user_id, role)
    VALUES (new_clinic_id, NEW.id, 'owner');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- Trigger: ربط عضو فريق عند التسجيل
-- ============================================

CREATE OR REPLACE FUNCTION link_invited_member()
RETURNS TRIGGER AS $$
DECLARE
  invite_clinic_id UUID;
  invite_role member_role;
BEGIN
  invite_clinic_id := (NEW.raw_user_meta_data->>'clinic_id')::UUID;
  invite_role := (NEW.raw_user_meta_data->>'role')::member_role;

  IF invite_clinic_id IS NOT NULL AND invite_role IS NOT NULL THEN
    INSERT INTO clinic_members (clinic_id, user_id, role)
    VALUES (invite_clinic_id, NEW.id, invite_role)
    ON CONFLICT (clinic_id, user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_link_clinic
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION link_invited_member();

-- ============================================
-- Trigger: تحديث updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER clinics_updated_at BEFORE UPDATE ON clinics FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER treatments_updated_at BEFORE UPDATE ON treatments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tooth_records ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_select_clinic_members" ON profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM clinic_members cm1
    JOIN clinic_members cm2 ON cm1.clinic_id = cm2.clinic_id
    WHERE cm1.user_id = auth.uid() AND cm2.user_id = profiles.id
      AND cm1.is_active = TRUE AND cm2.is_active = TRUE
  ));
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (id = auth.uid());

-- Clinics
CREATE POLICY "clinics_select" ON clinics FOR SELECT USING (is_clinic_member(id));
CREATE POLICY "clinics_insert" ON clinics FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "clinics_update" ON clinics FOR UPDATE USING (is_clinic_owner(id));

-- Clinic Members
CREATE POLICY "members_select" ON clinic_members FOR SELECT USING (is_clinic_member(clinic_id));
CREATE POLICY "members_insert_self" ON clinic_members FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "members_insert" ON clinic_members FOR INSERT WITH CHECK (is_clinic_owner(clinic_id));
CREATE POLICY "members_update" ON clinic_members FOR UPDATE USING (is_clinic_owner(clinic_id));
CREATE POLICY "members_delete" ON clinic_members FOR DELETE USING (is_clinic_owner(clinic_id));

-- Patients
CREATE POLICY "patients_all" ON patients FOR ALL USING (is_clinic_member(clinic_id));

-- Appointments
CREATE POLICY "appointments_all" ON appointments FOR ALL USING (is_clinic_member(clinic_id));

-- Procedures
CREATE POLICY "procedures_all" ON procedures FOR ALL USING (is_clinic_member(clinic_id));

-- Treatments
CREATE POLICY "treatments_all" ON treatments FOR ALL USING (is_clinic_member(clinic_id));

-- Invoices
CREATE POLICY "invoices_all" ON invoices FOR ALL USING (is_clinic_member(clinic_id));

-- Invoice Items (via invoice clinic)
CREATE POLICY "invoice_items_all" ON invoice_items FOR ALL
  USING (EXISTS (SELECT 1 FROM invoices i WHERE i.id = invoice_id AND is_clinic_member(i.clinic_id)));

-- Payments (via invoice clinic)
CREATE POLICY "payments_all" ON payments FOR ALL
  USING (EXISTS (SELECT 1 FROM invoices i WHERE i.id = invoice_id AND is_clinic_member(i.clinic_id)));

-- Tooth Records
CREATE POLICY "tooth_records_all" ON tooth_records FOR ALL USING (is_clinic_member(clinic_id));

-- ============================================
-- إجراءات مساعدة
-- ============================================

CREATE OR REPLACE FUNCTION generate_file_number(p_clinic_id UUID)
RETURNS TEXT AS $$
DECLARE
  next_num INT;
BEGIN
  SELECT COALESCE(MAX(CAST(file_number AS INT)), 0) + 1
  INTO next_num
  FROM patients
  WHERE clinic_id = p_clinic_id AND file_number ~ '^\d+$';
  RETURN LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION generate_invoice_number(p_clinic_id UUID)
RETURNS TEXT AS $$
DECLARE
  next_num INT;
  year_prefix TEXT;
BEGIN
  year_prefix := TO_CHAR(NOW(), 'YYYY');
  SELECT COALESCE(MAX(CAST(SPLIT_PART(invoice_number, '-', 2) AS INT)), 0) + 1
  INTO next_num
  FROM invoices
  WHERE clinic_id = p_clinic_id AND invoice_number LIKE year_prefix || '-%';
  RETURN year_prefix || '-' || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إجراءات افتراضية للعيادة الجديدة
CREATE OR REPLACE FUNCTION seed_default_procedures(p_clinic_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO procedures (clinic_id, name_ar, name_en, price, duration_minutes) VALUES
    (p_clinic_id, 'فحص عام', 'General Checkup', 50, 30),
    (p_clinic_id, 'تنظيف أسنان', 'Teeth Cleaning', 100, 45),
    (p_clinic_id, 'حشوة', 'Filling', 150, 60),
    (p_clinic_id, 'خلع سن', 'Extraction', 200, 45),
    (p_clinic_id, 'علاج عصب', 'Root Canal', 500, 90),
    (p_clinic_id, 'تاج', 'Crown', 800, 60),
    (p_clinic_id, 'زراعة', 'Implant', 2000, 120),
    (p_clinic_id, 'تبييض أسنان', 'Teeth Whitening', 300, 60);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
