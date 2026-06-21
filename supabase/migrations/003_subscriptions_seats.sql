-- Asnany platform: subscriptions, seat licensing, and prescriptions

-- Subscription & licensing fields on clinics
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'trial';
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'trialing';
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS monthly_fee NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMPTZ;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS seats_total INTEGER NOT NULL DEFAULT 1;

-- Prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  diagnosis TEXT,
  notes TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prescriptions_clinic ON prescriptions(clinic_id, issued_at DESC);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id, issued_at DESC);

ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prescriptions_select" ON prescriptions FOR SELECT
  USING (is_clinic_member(clinic_id));
CREATE POLICY "prescriptions_insert" ON prescriptions FOR INSERT
  WITH CHECK (is_clinic_member(clinic_id));
CREATE POLICY "prescriptions_update" ON prescriptions FOR UPDATE
  USING (is_clinic_member(clinic_id));
CREATE POLICY "prescriptions_delete" ON prescriptions FOR DELETE
  USING (is_clinic_member(clinic_id));

-- Seats used = active members per clinic (derived view for reporting)
CREATE OR REPLACE VIEW clinic_seat_usage AS
SELECT c.id AS clinic_id,
       c.seats_total,
       COUNT(m.id) FILTER (WHERE m.is_active) AS seats_used
FROM clinics c
LEFT JOIN clinic_members m ON m.clinic_id = c.id
GROUP BY c.id, c.seats_total;
