-- Migration: Add optional text input field per question
-- Description: Each question can now have an optional text input field

-- Add column for optional text input
ALTER TABLE analysis_questions 
ADD COLUMN IF NOT EXISTS allow_text_input BOOLEAN NOT NULL DEFAULT FALSE;

-- Add column for text input label (optional custom label)
ALTER TABLE analysis_questions 
ADD COLUMN IF NOT EXISTS text_input_label TEXT DEFAULT 'Möchtest du noch etwas hinzufügen?';

-- Add column for text input placeholder
ALTER TABLE analysis_questions 
ADD COLUMN IF NOT EXISTS text_input_placeholder TEXT DEFAULT 'Deine Anmerkung...';

-- Comment for documentation
COMMENT ON COLUMN analysis_questions.allow_text_input IS 'If true, shows an optional text input field after the main question input';
COMMENT ON COLUMN analysis_questions.text_input_label IS 'Custom label for the optional text input';
COMMENT ON COLUMN analysis_questions.text_input_placeholder IS 'Placeholder text for the optional text input';

