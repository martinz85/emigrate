-- Migration: 038_site_content.sql
-- Content Management System - Site Content Table
-- Epic 14.1: Content Management - Text Editor

-- Create site_content table for managing editable frontend content
CREATE TABLE IF NOT EXISTS site_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section VARCHAR(100) NOT NULL,
    key VARCHAR(200) NOT NULL,
    content_type VARCHAR(50) NOT NULL DEFAULT 'text', -- text, html, json
    content TEXT NOT NULL,
    label VARCHAR(255),
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),

    -- Ensure unique constraint for section + key combination
    UNIQUE(section, key)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_site_content_section ON site_content(section);
CREATE INDEX IF NOT EXISTS idx_site_content_section_key ON site_content(section, key);
CREATE INDEX IF NOT EXISTS idx_site_content_updated_at ON site_content(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Admin access (Admin can do everything)
CREATE POLICY "Admin can view all site content" ON site_content
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admin can insert site content" ON site_content
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update site content" ON site_content
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admin can delete site content" ON site_content
    FOR DELETE USING (public.is_admin());

-- Public read access for all content (no auth required)
CREATE POLICY "Public can read site content" ON site_content
    FOR SELECT USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_site_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_site_content_updated_at
    BEFORE UPDATE ON site_content
    FOR EACH ROW
    EXECUTE FUNCTION update_site_content_updated_at();

-- Function to set created_by on insert
CREATE OR REPLACE FUNCTION set_site_content_created_by()
RETURNS TRIGGER AS $$
BEGIN
    NEW.created_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically set created_by
CREATE TRIGGER trigger_set_site_content_created_by
    BEFORE INSERT ON site_content
    FOR EACH ROW
    EXECUTE FUNCTION set_site_content_created_by();

-- Seed default content from current hardcoded texts
INSERT INTO site_content (section, key, content_type, content, label, description) VALUES
-- Header Section
('header', 'logo_text', 'text', 'Auswander-Profi', 'Logo Text', 'Text neben dem Logo-Icon'),
('header', 'nav_link_1_text', 'text', 'So funktioniert''s', 'Nav Link 1', 'Erster Navigationslink'),
('header', 'nav_link_2_text', 'text', 'Preise', 'Nav Link 2', 'Zweiter Navigationslink'),
('header', 'nav_link_3_text', 'text', 'E-Books', 'Nav Link 3', 'Dritter Navigationslink'),
('header', 'nav_link_4_text', 'text', 'Login', 'Nav Link 4', 'Vierter Navigationslink'),
('header', 'cta_button_text', 'text', 'Kostenlos starten', 'CTA Button', 'Hauptbutton im Header'),

-- Footer Section
('footer', 'logo_text', 'text', 'Auswander-Profi', 'Logo Text', 'Footer Logo Text'),
('footer', 'description', 'text', 'Finde dein perfektes Auswanderungsland mit unserem AI-gestützten Analyse-Tool. Auf dich zugeschnitten für deine Entscheidung.', 'Beschreibung', 'Footer Beschreibung'),
('footer', 'product_title', 'text', 'Produkt', 'Produkt Titel', 'Footer Produkt Spalte Titel'),
('footer', 'product_link_1', 'text', 'Analyse starten', 'Produkt Link 1', 'Footer Produkt Link 1'),
('footer', 'product_link_2', 'text', 'E-Books', 'Produkt Link 2', 'Footer Produkt Link 2'),
('footer', 'product_link_3', 'text', 'Preise', 'Produkt Link 3', 'Footer Produkt Link 3'),
('footer', 'product_link_4', 'text', 'PRO Abo', 'Produkt Link 4', 'Footer Produkt Link 4'),
('footer', 'legal_title', 'text', 'Rechtliches', 'Rechtliches Titel', 'Footer Rechtliches Spalte Titel'),
('footer', 'legal_link_1', 'text', 'Impressum', 'Rechtliches Link 1', 'Footer Rechtliches Link 1'),
('footer', 'legal_link_2', 'text', 'Datenschutz', 'Rechtliches Link 2', 'Footer Rechtliches Link 2'),
('footer', 'legal_link_3', 'text', 'AGB', 'Rechtliches Link 3', 'Footer Rechtliches Link 3'),
('footer', 'legal_link_4', 'text', 'Kontakt', 'Rechtliches Link 4', 'Footer Rechtliches Link 4'),
('footer', 'legal_link_5', 'text', 'Meine Käufe finden', 'Rechtliches Link 5', 'Footer Rechtliches Link 5'),
('footer', 'copyright', 'text', '© 2024 Auswanderer-Plattform. Alle Rechte vorbehalten.', 'Copyright', 'Footer Copyright Text'),
('footer', 'disclaimer', 'text', 'Hinweis: Diese Plattform bietet keine Rechts- oder Steuerberatung. Konsultieren Sie für verbindliche Auskünfte einen Fachexperten.', 'Disclaimer', 'Footer Disclaimer'),

-- Hero Section
('hero', 'headline', 'text', 'Finde dein perfektes Auswanderungsland', 'Headline', 'Hauptüberschrift'),
('hero', 'subheadline', 'text', 'Unser AI analysiert, was DIR wichtig ist - und findet das Land, das perfekt zu dir passt. In nur 5-10 Minuten.', 'Subheadline', 'Unterüberschrift'),
('hero', 'cta_primary_text', 'text', 'Kostenlos starten', 'Primärer CTA', 'Hauptbutton Text'),
('hero', 'cta_secondary_text', 'text', 'So funktioniert''s', 'Sekundärer CTA', 'Sekundärbutton Text'),
('hero', 'trust_badge_1', 'text', 'Auf dich zugeschnitten', 'Trust Badge 1', 'Vertrauenssignal 1'),
('hero', 'trust_badge_2', 'text', 'AI-gestützte Analyse', 'Trust Badge 2', 'Vertrauenssignal 2'),
('hero', 'trust_badge_3', 'text', 'Sofortige Vorschau', 'Trust Badge 3', 'Vertrauenssignal 3'),
('hero', 'trust_badge_4', 'text', 'DSGVO-konform', 'Trust Badge 4', 'Vertrauenssignal 4'),

-- How It Works Section
('how_it_works', 'title', 'text', 'So funktioniert''s', 'Titel', 'Sektion Titel'),
('how_it_works', 'subtitle', 'text', 'In nur 4 einfachen Schritten zu deinem perfekten Auswanderungsland', 'Untertitel', 'Sektion Untertitel'),
('how_it_works', 'step_1_title', 'text', 'Profil erstellen', 'Schritt 1 Titel', 'Erster Schritt Titel'),
('how_it_works', 'step_1_description', 'text', 'Beantworte ein paar grundlegende Fragen zu deiner Situation.', 'Schritt 1 Beschreibung', 'Erster Schritt Beschreibung'),
('how_it_works', 'step_2_title', 'text', 'AI-Analyse starten', 'Schritt 2 Titel', 'Zweiter Schritt Titel'),
('how_it_works', 'step_2_description', 'text', 'Beantworte Fragen zu deinen persönlichen Prioritäten.', 'Schritt 2 Beschreibung', 'Zweiter Schritt Beschreibung'),
('how_it_works', 'step_3_title', 'text', 'Ergebnis erhalten', 'Schritt 3 Titel', 'Dritter Schritt Titel'),
('how_it_works', 'step_3_description', 'text', 'Erhalte dein persönliches Länder-Ranking mit Empfehlungen.', 'Schritt 3 Beschreibung', 'Dritter Schritt Beschreibung'),
('how_it_works', 'step_4_title', 'text', 'Plan starten', 'Schritt 4 Titel', 'Vierter Schritt Titel'),
('how_it_works', 'step_4_description', 'text', 'Mit konkreten nächsten Schritten deinen Traum verwirklichen.', 'Schritt 4 Beschreibung', 'Vierter Schritt Beschreibung'),

-- Founder Story Section
('founder_story', 'title', 'text', 'Über den Gründer', 'Titel', 'Gründer Story Titel'),
('founder_story', 'paragraph_1', 'text', '„Ich bin selbst zweimal ausgewandert: Mit 3 Jahren von Polen nach Deutschland, und mit Anfang 30 mit meiner Familie – zwei kleine Kinder im Gepäck – nach Südschweden."', 'Absatz 1', 'Erster Absatz der Gründer Story'),
('founder_story', 'paragraph_2', 'text', '„Bei der Auswanderungsplanung kommen viele Fragen auf."', 'Absatz 2', 'Zweiter Absatz der Gründer Story'),
('founder_story', 'paragraph_3', 'text', '„Mit dieser Plattform möchte ich mein Wissen teilen und anderen helfen, ihre Auswanderungsträume Wirklichkeit werden zu lassen."', 'Absatz 3', 'Dritter Absatz der Gründer Story'),
('founder_story', 'signature', 'text', '— Martin', 'Unterschrift', 'Gründer Unterschrift'),
('founder_story', 'role', 'text', 'Gründer, Auswanderer-Plattform', 'Rolle', 'Gründer Rolle/Beschreibung'),

-- FAQ Section
('faq', 'title', 'text', 'Häufige Fragen', 'Titel', 'FAQ Sektion Titel'),
('faq', 'subtitle', 'text', 'Alles was du wissen musst', 'Untertitel', 'FAQ Sektion Untertitel'),
('faq', 'items', 'json', '[{"question": "Wie funktioniert die AI-Analyse?", "answer": "Unser AI-Assistent stellt dir Fragen zu deinen persönlichen Prioritäten. Du gibst an, wie wichtig dir verschiedene Kriterien sind (1-5), und beantwortest Kontextfragen. Basierend auf deinen Antworten erstellen wir ein individuelles Länder-Ranking mit Empfehlungen."}, {"question": "Welche Länder werden analysiert?", "answer": "Wir analysieren über 50 beliebte Auswanderungsländer weltweit, darunter alle EU-Länder, Schweiz, UK, USA, Kanada, Australien, Neuseeland, Thailand, und viele mehr. Die Empfehlung basiert auf deinem persönlichen Profil."}, {"question": "Ist die Vorschau wirklich kostenlos?", "answer": "Ja! Du kannst die komplette AI-Analyse durchführen und erhältst eine kostenlose 2-Seiten-Vorschau mit deinem Top-3-Ranking. Für die vollständige Analyse mit Detailmatrix und Empfehlungen gibt es die Kauf-Option."}, {"question": "Was ist im PRO-Abo enthalten?", "answer": "PRO-Mitglieder erhalten unbegrenzten Zugang zu allen AI-Analysen, allen PDFs, allen 4 E-Books, dem Projekt-Dashboard mit Checklisten und Timeline, sowie Tools wie Länder-Vergleich, Visa-Navigator und Kosten-Rechner."}, {"question": "Kann ich das PRO-Abo kündigen?", "answer": "Ja, du kannst jederzeit kündigen. Es gibt keine Mindestlaufzeit. Nach der Kündigung hast du bis zum Ende der bezahlten Periode Zugang zu allen PRO-Features."}, {"question": "Ist das eine Rechts- oder Steuerberatung?", "answer": "Nein. Unsere Plattform bietet Orientierungshilfe und Informationen basierend auf öffentlich verfügbaren Daten. Für verbindliche Auskünfte zu Visa, Steuern oder rechtlichen Fragen solltest du einen Fachexperten konsultieren."}]', 'FAQ Liste', 'Alle FAQ Einträge'),

-- Loading Screen Section
('loading_screen', 'title', 'text', 'Analysiere deine Antworten...', 'Titel', 'Loading Screen Titel'),
('loading_screen', 'subtitle', 'text', 'Unsere AI vergleicht dein Profil mit Daten aus über 50 Ländern', 'Untertitel', 'Loading Screen Untertitel'),
('loading_screen', 'fun_facts', 'json', '["💡 Wusstest du? Portugal hat über 300 Sonnentage pro Jahr.", "🏔️ Die Schweiz hat vier offizielle Landessprachen.", "🌴 In Thailand kostet ein Mittagessen oft unter 3 Euro.", "🇸🇪 Schweden bietet 480 Tage Elternzeit.", "🏖️ Spanien ist das Land mit den meisten Expats in Europa.", "🦘 Australien hat mehr Kängurus als Menschen.", "🇳🇿 Neuseeland war das erste Land mit Frauenwahlrecht.", "🇨🇦 Kanada hat die längste Küstenlinie der Welt.", "🏝️ Zypern hat im Durchschnitt 340 Sonnentage im Jahr.", "🇳🇱 Die Niederlande haben mehr Fahrräder als Einwohner."]', 'Fun Facts', 'Loading Screen Fun Facts')

ON CONFLICT (section, key) DO NOTHING;
