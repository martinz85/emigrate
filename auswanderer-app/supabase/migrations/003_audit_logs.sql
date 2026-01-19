-- ============================================
-- Migration 003: Audit Logs Table
--
-- DSGVO-Compliance: Alle Admin-Aktionen protokollieren
-- ============================================

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  target_id TEXT,
  target_type TEXT,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes für schnelle Abfragen
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON public.audit_logs(admin_id);

-- RLS aktivieren
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Nur Admins können Audit Logs lesen
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

-- Service Role kann schreiben (keine explizite Policy nötig, service_role bypassed RLS)

-- Kommentar zur Tabelle
COMMENT ON TABLE public.audit_logs IS 'DSGVO-Compliance: Protokolliert alle Admin-Aktionen für Nachweisbarkeit';

