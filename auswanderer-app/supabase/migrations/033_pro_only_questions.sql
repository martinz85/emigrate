-- ============================================
-- Migration 033: Add PRO-Only flag to questions
-- Story 8.4: PRO-Only Fragen
-- ============================================

-- Add is_pro_only column
ALTER TABLE analysis_questions 
ADD COLUMN IF NOT EXISTS is_pro_only BOOLEAN DEFAULT FALSE;

-- Index for efficient filtering (partial index for TRUE values)
CREATE INDEX IF NOT EXISTS idx_questions_pro_only 
ON analysis_questions(is_pro_only) 
WHERE is_pro_only = TRUE;

-- Comment for documentation
COMMENT ON COLUMN analysis_questions.is_pro_only IS 
'If true, question is only shown to PRO subscribers. Free users will skip this question.';

