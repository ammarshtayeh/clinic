-- Asnany platform upgrade: super admin, logos, audit

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS logo_url TEXT;

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_clinic ON audit_logs(clinic_id, created_at DESC);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_select" ON audit_logs FOR SELECT
  USING (is_clinic_member(clinic_id) OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = TRUE));

CREATE POLICY "audit_insert" ON audit_logs FOR INSERT
  WITH CHECK (is_clinic_member(clinic_id) OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = TRUE));

-- Super admin can view all clinics
CREATE POLICY "clinics_super_admin" ON clinics FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = TRUE));

CREATE POLICY "clinics_super_update" ON clinics FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = TRUE));

-- Storage bucket for clinic logos
INSERT INTO storage.buckets (id, name, public) VALUES ('clinic-logos', 'clinic-logos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "logo_upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'clinic-logos' AND auth.uid() IS NOT NULL);

CREATE POLICY "logo_update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'clinic-logos' AND auth.uid() IS NOT NULL);

CREATE POLICY "logo_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'clinic-logos');

CREATE POLICY "logo_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'clinic-logos' AND auth.uid() IS NOT NULL);
