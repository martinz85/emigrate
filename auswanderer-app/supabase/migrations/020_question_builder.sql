-- Migration 020: Question Builder
-- Story 10.7: Fragen-Builder für dynamische Analyse-Fragen
-- 
-- Features:
-- - Kategorien für Fragen-Gruppierung
-- - Dynamische Analyse-Fragen mit verschiedenen Typen
-- - Bild-Upload Support via Supabase Storage
-- - Gewichtung für AI-Analyse

-- ============================================
-- 1. Question Categories Table
-- ============================================

CREATE TABLE IF NOT EXISTS question_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_key TEXT UNIQUE, -- z.B. 'financial', 'practical' für Mapping
  description TEXT,
  icon TEXT, -- Emoji für Kategorie
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index für Sortierung
CREATE INDEX IF NOT EXISTS idx_question_categories_sort ON question_categories(sort_order);

-- ============================================
-- 2. Analysis Questions Table
-- ============================================

CREATE TABLE IF NOT EXISTS analysis_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES question_categories(id) ON DELETE SET NULL,
  
  -- Frage-Inhalte
  question_text TEXT NOT NULL,
  question_key TEXT UNIQUE, -- z.B. 'living_costs' für Mapping zu alten Kriterien
  help_text TEXT, -- Für Info-Modal (ℹ️)
  
  -- Typ-Konfiguration
  question_type TEXT NOT NULL DEFAULT 'rating' 
    CHECK (question_type IN ('boolean', 'rating', 'text', 'select')),
  select_options JSONB, -- Für select-Typ: [{"value": "...", "label": "..."}]
  
  -- Gewichtung & Sortierung
  weight NUMERIC(4,2) NOT NULL DEFAULT 1.00 CHECK (weight >= 0 AND weight <= 10),
  sort_order INTEGER NOT NULL DEFAULT 0,
  
  -- Bild (optional)
  image_path TEXT, -- Pfad in Supabase Storage: questions/{id}.webp
  
  -- Status
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indizes
CREATE INDEX IF NOT EXISTS idx_analysis_questions_category ON analysis_questions(category_id);
CREATE INDEX IF NOT EXISTS idx_analysis_questions_sort ON analysis_questions(sort_order);
CREATE INDEX IF NOT EXISTS idx_analysis_questions_active ON analysis_questions(is_active) WHERE is_active = true;

-- ============================================
-- 3. Updated_at Trigger
-- ============================================

-- Trigger-Funktion (falls noch nicht vorhanden)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für question_categories
DROP TRIGGER IF EXISTS trigger_question_categories_updated_at ON question_categories;
CREATE TRIGGER trigger_question_categories_updated_at
  BEFORE UPDATE ON question_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger für analysis_questions
DROP TRIGGER IF EXISTS trigger_analysis_questions_updated_at ON analysis_questions;
CREATE TRIGGER trigger_analysis_questions_updated_at
  BEFORE UPDATE ON analysis_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. RLS Policies
-- ============================================

ALTER TABLE question_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_questions ENABLE ROW LEVEL SECURITY;

-- Public: Jeder kann Kategorien lesen
CREATE POLICY "Anyone can read question categories"
  ON question_categories
  FOR SELECT
  USING (true);

-- Public: Jeder kann aktive Fragen lesen (für Frontend-Analyse)
CREATE POLICY "Anyone can read active questions"
  ON analysis_questions
  FOR SELECT
  USING (is_active = true);

-- Admin: Voller Zugriff auf Kategorien
CREATE POLICY "Admin full access to categories"
  ON question_categories
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- Admin: Voller Zugriff auf Fragen (inkl. inaktive)
CREATE POLICY "Admin full access to questions"
  ON analysis_questions
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- Admin: Kann auch inaktive Fragen lesen
CREATE POLICY "Admin can read all questions"
  ON analysis_questions
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- ============================================
-- 5. Seed: Kategorien aus bestehendem Schema
-- ============================================

INSERT INTO question_categories (name_key, name, icon, sort_order) VALUES
  ('financial', 'Finanziell', '💰', 1),
  ('practical', 'Praktisch', '📋', 2),
  ('lifestyle', 'Lifestyle', '🌴', 3),
  ('security', 'Sicherheit', '🛡️', 4),
  ('personal', 'Persönlich', '👤', 5),
  ('special', 'Spezial', '🐾', 6),
  ('social', 'Sozial', '🤝', 7),
  ('career', 'Karriere', '💼', 8),
  ('family', 'Familie+', '👶', 9),
  ('real_estate', 'Immobilien', '🏠', 10)
ON CONFLICT (name_key) DO NOTHING;

-- ============================================
-- 6. Seed: Bestehende 28 Kriterien migrieren
-- ============================================

-- Temporäre Funktion für Kategorie-Lookup
CREATE OR REPLACE FUNCTION get_category_id(key TEXT) RETURNS UUID AS $$
  SELECT id FROM question_categories WHERE name_key = key LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Kriterien einfügen
INSERT INTO analysis_questions (question_key, category_id, question_text, help_text, question_type, weight, sort_order, is_active) VALUES
  -- FINANCIAL (4)
  ('living_costs', get_category_id('financial'), 'Wie wichtig ist es dir, dass die Lebenshaltungskosten in deinem Zielland zu deinem Budget passen?', 'Vergleich der monatlichen Kosten für Wohnen, Essen, Transport etc.', 'rating', 1.00, 1, true),
  ('income_source', get_category_id('financial'), 'Wie wichtig ist es, dass du deine aktuelle Einkommensquelle im Zielland fortführen kannst?', 'Remote Work, lokaler Job, Selbständigkeit oder Rente.', 'rating', 1.00, 2, true),
  ('taxes', get_category_id('financial'), 'Wie wichtig ist eine günstige Steuer-Situation im Zielland?', 'Einkommenssteuer, Kapitalertragssteuer, Doppelbesteuerung.', 'rating', 1.00, 3, true),
  ('money_transfer', get_category_id('financial'), 'Wie wichtig ist es, Geld einfach ins Zielland transferieren zu können?', 'Bankkonten, Überweisungen, Kapitalverkehrskontrollen.', 'rating', 1.00, 4, true),
  
  -- PRACTICAL (6)
  ('visa', get_category_id('practical'), 'Wie wichtig ist ein einfacher Visa-Prozess für dich?', 'Aufenthaltsgenehmigung, Arbeitserlaubnis, Bürokratie.', 'rating', 1.00, 5, true),
  ('language', get_category_id('practical'), 'Wie wichtig ist es, dass du mit Englisch (oder Deutsch) im Alltag durchkommst?', 'Verbreitung von Englisch, Notwendigkeit die Landessprache zu lernen.', 'rating', 1.00, 6, true),
  ('healthcare', get_category_id('practical'), 'Wie wichtig ist ein gutes Gesundheitssystem und soziale Absicherung?', 'Qualität der Versorgung, Zugang für Ausländer, Altersvorsorge.', 'rating', 1.00, 7, true),
  ('bureaucracy', get_category_id('practical'), 'Wie wichtig ist wenig Bürokratie im Alltag?', 'Behördengänge, digitale Verwaltung, Effizienz.', 'rating', 1.00, 8, true),
  ('return_option', get_category_id('practical'), 'Wie wichtig ist es, dass du einfach nach Deutschland zurückkehren könntest?', 'Nähe zur Heimat, Flugverbindungen, rechtliche Optionen.', 'rating', 1.00, 9, true),
  ('citizenship_path', get_category_id('practical'), 'Wie wichtig ist ein Pfad zur permanenten Aufenthaltserlaubnis oder Staatsbürgerschaft?', 'Langfristige Perspektive, Einbürgerungsmöglichkeiten.', 'rating', 1.00, 10, true),
  
  -- LIFESTYLE (4)
  ('climate', get_category_id('lifestyle'), 'Wie wichtig ist dein bevorzugtes Klima?', 'Sonnenstunden, Temperaturen, Jahreszeiten.', 'rating', 1.00, 11, true),
  ('culture', get_category_id('lifestyle'), 'Wie wichtig ist kulturelle Ähnlichkeit zu deiner Heimat?', 'Westliche Werte, Lebensart, Essgewohnheiten.', 'rating', 1.00, 12, true),
  ('expat_community', get_category_id('lifestyle'), 'Wie wichtig ist eine bestehende deutschsprachige oder internationale Expat-Community?', 'Deutsche Vereine, internationale Schulen, Netzwerke.', 'rating', 1.00, 13, true),
  ('nature', get_category_id('lifestyle'), 'Wie wichtig ist Zugang zu Natur (Berge, Meer, Wälder)?', 'Outdoor-Aktivitäten, Landschaft, Erholungsgebiete.', 'rating', 1.00, 14, true),
  
  -- SECURITY (2)
  ('safety', get_category_id('security'), 'Wie wichtig ist niedrige Kriminalität im Zielland?', 'Gewaltverbrechen, Diebstahl, persönliche Sicherheit.', 'rating', 1.00, 15, true),
  ('geopolitics', get_category_id('security'), 'Wie wichtig ist geopolitische Stabilität und Sicherheit vor Konflikten?', 'Neutralität, Entfernung zu Krisenherden, NATO-Mitgliedschaft.', 'rating', 1.00, 16, true),
  
  -- PERSONAL (6)
  ('family', get_category_id('personal'), 'Wie wichtig ist Familienfreundlichkeit im Zielland?', 'Kinderbetreuung, Schulen, Partner-Karriere.', 'rating', 1.00, 17, true),
  ('distance_home', get_category_id('personal'), 'Wie wichtig ist die Nähe zu Deutschland für Besuche?', 'Flugzeit, Direktverbindungen, Kosten.', 'rating', 1.00, 18, true),
  ('internet', get_category_id('personal'), 'Wie wichtig ist schnelles, stabiles Internet?', 'Für Remote Worker besonders relevant.', 'rating', 1.00, 19, true),
  ('infrastructure', get_category_id('personal'), 'Wie wichtig ist eine gute Infrastruktur (Straßen, ÖPNV, Flughäfen)?', 'Verkehrsanbindung, öffentlicher Nahverkehr, Flugverbindungen.', 'rating', 1.00, 20, true),
  ('urgency', get_category_id('personal'), 'Wie schnell möchtest/musst du auswandern?', 'Zeitrahmen für die Umsetzung.', 'rating', 1.00, 21, true),
  ('timezone', get_category_id('personal'), 'Wie wichtig ist eine kompatible Zeitzone (z.B. für Remote-Arbeit mit EU)?', 'Für Zusammenarbeit mit europäischen Teams.', 'rating', 1.00, 22, true),
  
  -- SPECIAL (1)
  ('pets', get_category_id('special'), 'Hast du Haustiere die mit dir umziehen?', 'Einreisebestimmungen, Quarantäne, Tierfreundlichkeit.', 'rating', 1.00, 23, true),
  
  -- SOCIAL (1)
  ('community', get_category_id('social'), 'Wie wichtig ist eine bestehende Community deiner Religion oder Vereinigung?', 'Religionsgemeinschaften, Vereine, Hobby-Gruppen.', 'rating', 1.00, 24, true),
  
  -- CAREER (1)
  ('job_market', get_category_id('career'), 'Wie wichtig ist ein guter Arbeitsmarkt oder Gründerfreundlichkeit?', 'Job-Chancen, Freelancer-Regelungen, Unternehmertum.', 'rating', 1.00, 25, true),
  
  -- FAMILY+ (2)
  ('education', get_category_id('family'), 'Wie wichtig ist Qualität der Schulen und Kinderbetreuung?', 'Schulsystem, internationale Schulen, Universitäten.', 'rating', 1.00, 26, true),
  ('quality_of_life', get_category_id('family'), 'Wie wichtig ist allgemein hohe Lebensqualität?', 'HDI, Lebenserwartung, allgemeines Wohlbefinden.', 'rating', 1.00, 27, true),
  
  -- REAL ESTATE (1)
  ('real_estate_market', get_category_id('real_estate'), 'Wie wichtig ist es, dass du Immobilien/Grundstücke im Zielland kaufen kannst?', 'Möglichkeiten für Ausländer zum Erwerb von Eigentum, Marktpreise, Beschränkungen.', 'rating', 1.00, 28, true)
ON CONFLICT (question_key) DO NOTHING;

-- Cleanup temporäre Funktion
DROP FUNCTION IF EXISTS get_category_id(TEXT);

-- ============================================
-- 7. Storage Bucket für Bilder
-- ============================================
-- HINWEIS: Bucket muss im Supabase Dashboard erstellt werden:
-- Name: question-images
-- Public: true
-- File size limit: 2MB
-- Allowed MIME types: image/jpeg, image/png, image/webp

-- Storage Policy (SQL-basiert, falls via CLI):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('question-images', 'question-images', true);

-- ============================================
-- 8. Grant Permissions
-- ============================================

-- Anon kann öffentliche Daten lesen (für Frontend ohne Login)
GRANT SELECT ON question_categories TO anon;
GRANT SELECT ON analysis_questions TO anon;

-- Authenticated users (inkl. Admins)
GRANT SELECT ON question_categories TO authenticated;
GRANT SELECT ON analysis_questions TO authenticated;

-- Service Role hat vollen Zugriff (für API Routes)
GRANT ALL ON question_categories TO service_role;
GRANT ALL ON analysis_questions TO service_role;

-- ============================================
-- Done!
-- ============================================

