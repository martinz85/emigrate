-- Migration: Analysis Settings
-- Description: Einstellungen für die Analyse (z.B. optionales Textfeld)

-- Create settings table
CREATE TABLE IF NOT EXISTS analysis_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE analysis_settings ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access settings" ON analysis_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- Public read access (for frontend to check settings)
CREATE POLICY "Public read settings" ON analysis_settings
  FOR SELECT USING (true);

-- Insert default settings
INSERT INTO analysis_settings (key, value, description) VALUES
  ('additional_notes_field', '{"enabled": true, "label": "Möchtest du uns noch etwas mitteilen?", "placeholder": "z.B. Besondere Anforderungen, Hobbys, Familie...", "required": false}', 'Optionales Textfeld am Ende der Analyse für zusätzliche Nutzer-Eingaben'),
  ('show_progress_bar', '{"enabled": true}', 'Fortschrittsanzeige während der Analyse anzeigen'),
  ('auto_advance', '{"enabled": true, "delay_ms": 300}', 'Automatisch zur nächsten Frage nach Beantwortung')
ON CONFLICT (key) DO NOTHING;

-- Update trigger
CREATE OR REPLACE FUNCTION update_analysis_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER analysis_settings_updated
  BEFORE UPDATE ON analysis_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_analysis_settings_timestamp();

