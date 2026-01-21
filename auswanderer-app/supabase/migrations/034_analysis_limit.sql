-- ============================================
-- Migration 034: Analysis Limit for PRO Users
-- Story 8.5: Tägliches Analyse-Limit
-- ============================================

-- Create app_settings table if not exists
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for app_settings (public read, admin write)
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Anyone can read app_settings" 
  ON app_settings FOR SELECT 
  USING (TRUE);

-- App Settings: pro_daily_analysis_limit
INSERT INTO app_settings (key, value, description)
VALUES ('pro_daily_analysis_limit', '5', 'Max analyses per day for PRO users (0 = unlimited)')
ON CONFLICT (key) DO NOTHING;

-- User-specific limit override
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS analysis_limit_override INTEGER;

COMMENT ON COLUMN profiles.analysis_limit_override IS 
'Override daily limit. NULL = use global setting, 0 = unlimited';

-- Daily analysis counter
CREATE TABLE IF NOT EXISTS user_analysis_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_analysis_counts_user_date 
ON user_analysis_counts(user_id, date);

-- RLS for user_analysis_counts
ALTER TABLE user_analysis_counts ENABLE ROW LEVEL SECURITY;

-- Users can read their own counts
CREATE POLICY "Users can view own analysis counts"
  ON user_analysis_counts FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert/update (via API)
CREATE POLICY "Service role can manage analysis counts"
  ON user_analysis_counts FOR ALL
  USING (auth.role() = 'service_role');

-- Comments
COMMENT ON TABLE user_analysis_counts IS 'Tracks daily analysis count per user for PRO limit enforcement';

