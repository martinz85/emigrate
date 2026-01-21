-- ============================================
-- Migration 036: Seed Roadmap Data
-- Story 8.6: Fahrplan mit Checkpoints (PRO Dashboard)
-- ============================================

-- Phase 1: Entscheidung & Recherche
INSERT INTO roadmap_phases (id, title, description, emoji, sort_order) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Entscheidung & Recherche', 'Die Grundlagen für deine Auswanderung legen', '🔍', 1),
  ('a1000000-0000-0000-0000-000000000002', 'Planung & Vorbereitung', 'Konkrete Schritte einleiten', '📋', 2),
  ('a1000000-0000-0000-0000-000000000003', 'Dokumente & Bürokratie', 'Papierkram erledigen', '📄', 3),
  ('a1000000-0000-0000-0000-000000000004', 'Umzug & Ankunft', 'Der große Tag und die erste Zeit', '✈️', 4),
  ('a1000000-0000-0000-0000-000000000005', 'Ankommen & Einleben', 'Dein neues Leben aufbauen', '🏠', 5)
ON CONFLICT (id) DO NOTHING;

-- Checkpoints für Phase 1: Entscheidung & Recherche
INSERT INTO roadmap_checkpoints (phase_id, title, description, sort_order) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Zielland entschieden', 'Du hast dich für ein Auswanderungsland entschieden', 1),
  ('a1000000-0000-0000-0000-000000000001', 'Analyse durchgeführt', 'Du hast die Länder-Analyse auf dieser Plattform gemacht', 2),
  ('a1000000-0000-0000-0000-000000000001', 'Visa-Anforderungen recherchiert', 'Du weißt welches Visum du brauchst', 3),
  ('a1000000-0000-0000-0000-000000000001', 'Budget grob kalkuliert', 'Du hast eine erste Kostenschätzung gemacht', 4),
  ('a1000000-0000-0000-0000-000000000001', 'Familie/Partner informiert', 'Alle wichtigen Personen sind eingeweiht', 5)
ON CONFLICT DO NOTHING;

-- Checkpoints für Phase 2: Planung & Vorbereitung
INSERT INTO roadmap_checkpoints (phase_id, title, description, sort_order) VALUES
  ('a1000000-0000-0000-0000-000000000002', 'Zeitplan erstellt', 'Du hast einen groben Zeitrahmen für die Auswanderung', 1),
  ('a1000000-0000-0000-0000-000000000002', 'Finanzen geordnet', 'Sparplan, Kontoeröffnung im Zielland recherchiert', 2),
  ('a1000000-0000-0000-0000-000000000002', 'Job-Situation geklärt', 'Remote-Work, Jobsuche oder eigenes Business geplant', 3),
  ('a1000000-0000-0000-0000-000000000002', 'Wohnsituation recherchiert', 'Du weißt wo du zuerst wohnen wirst', 4),
  ('a1000000-0000-0000-0000-000000000002', 'Sprachkenntnisse aufgebaut', 'Du lernst die Landessprache (falls nötig)', 5),
  ('a1000000-0000-0000-0000-000000000002', 'Krankenversicherung geklärt', 'Auslands-KV oder lokale Versicherung recherchiert', 6)
ON CONFLICT DO NOTHING;

-- Checkpoints für Phase 3: Dokumente & Bürokratie
INSERT INTO roadmap_checkpoints (phase_id, title, description, sort_order) VALUES
  ('a1000000-0000-0000-0000-000000000003', 'Reisepass gültig', 'Noch mindestens 6 Monate gültig', 1),
  ('a1000000-0000-0000-0000-000000000003', 'Visum beantragt', 'Antrag eingereicht oder Termin vereinbart', 2),
  ('a1000000-0000-0000-0000-000000000003', 'Führungszeugnis beantragt', 'Falls für Visum benötigt', 3),
  ('a1000000-0000-0000-0000-000000000003', 'Dokumente übersetzen lassen', 'Beglaubigte Übersetzungen besorgt', 4),
  ('a1000000-0000-0000-0000-000000000003', 'Abmeldung in Deutschland', 'Bei der Gemeinde abgemeldet', 5),
  ('a1000000-0000-0000-0000-000000000003', 'Versicherungen gekündigt', 'KFZ, Hausrat etc. gekündigt oder angepasst', 6),
  ('a1000000-0000-0000-0000-000000000003', 'Verträge gekündigt', 'Handyvertrag, Strom, Internet etc.', 7)
ON CONFLICT DO NOTHING;

-- Checkpoints für Phase 4: Umzug & Ankunft
INSERT INTO roadmap_checkpoints (phase_id, title, description, sort_order) VALUES
  ('a1000000-0000-0000-0000-000000000004', 'Flug/Transport gebucht', 'One-Way Ticket oder Container-Transport', 1),
  ('a1000000-0000-0000-0000-000000000004', 'Unterkunft für erste Tage', 'Hotel, Airbnb oder WG-Zimmer für die Ankunft', 2),
  ('a1000000-0000-0000-0000-000000000004', 'Haushalt aufgelöst', 'Wohnung gekündigt, Möbel verkauft/eingelagert', 3),
  ('a1000000-0000-0000-0000-000000000004', 'Abschied genommen', 'Goodbye-Party mit Freunden und Familie', 4),
  ('a1000000-0000-0000-0000-000000000004', 'Angekommen!', 'Du bist im neuen Land angekommen 🎉', 5)
ON CONFLICT DO NOTHING;

-- Checkpoints für Phase 5: Ankommen & Einleben
INSERT INTO roadmap_checkpoints (phase_id, title, description, sort_order) VALUES
  ('a1000000-0000-0000-0000-000000000005', 'Wohnung gefunden', 'Langfristige Unterkunft gesichert', 1),
  ('a1000000-0000-0000-0000-000000000005', 'Beim Amt registriert', 'Anmeldung beim lokalen Einwohnermeldeamt', 2),
  ('a1000000-0000-0000-0000-000000000005', 'Bankkonto eröffnet', 'Lokales Konto für Gehalt und Zahlungen', 3),
  ('a1000000-0000-0000-0000-000000000005', 'SIM-Karte/Handyvertrag', 'Lokale Telefonnummer', 4),
  ('a1000000-0000-0000-0000-000000000005', 'Erste Freunde gefunden', 'Lokale Kontakte oder Expat-Community', 5),
  ('a1000000-0000-0000-0000-000000000005', 'Steuernummer erhalten', 'Für Arbeit und Steuererklärung', 6),
  ('a1000000-0000-0000-0000-000000000005', 'Angekommen & eingelegt! 🎊', 'Du hast es geschafft!', 7)
ON CONFLICT DO NOTHING;

