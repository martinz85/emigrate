-- Update hero section headline to support gradient text
-- Split the headline into two parts for styling

-- First, check if we have the old single headline field
DO $$
BEGIN
  -- Update existing headline entry if it exists
  UPDATE site_content 
  SET 
    key = 'headline_part1',
    content = 'Finde dein perfektes',
    label = 'Headline Teil 1',
    description = 'Erster Teil der Hauptüberschrift (normaler Text)'
  WHERE section = 'hero' AND key = 'headline';
  
  -- Insert the second part if it doesn't exist
  INSERT INTO site_content (section, key, content, content_type, label, description)
  VALUES (
    'hero',
    'headline_part2',
    'Auswanderungsland',
    'text',
    'Headline Teil 2',
    'Zweiter Teil der Hauptüberschrift (mit Gradient-Farbe)'
  )
  ON CONFLICT (section, key) DO UPDATE
  SET 
    content = EXCLUDED.content,
    label = EXCLUDED.label,
    description = EXCLUDED.description;
END $$;

-- Ensure both parts exist with correct values
INSERT INTO site_content (section, key, content, content_type, label, description)
VALUES 
  (
    'hero',
    'headline_part1',
    'Finde dein perfektes',
    'text',
    'Headline Teil 1',
    'Erster Teil der Hauptüberschrift (normaler Text)'
  ),
  (
    'hero',
    'headline_part2',
    'Auswanderungsland',
    'text',
    'Headline Teil 2',
    'Zweiter Teil der Hauptüberschrift (mit Gradient-Farbe)'
  )
ON CONFLICT (section, key) DO NOTHING;

