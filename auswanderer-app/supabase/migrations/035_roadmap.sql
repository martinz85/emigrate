-- ============================================
-- Migration 035: Roadmap with Checkpoints
-- Story 8.6: Fahrplan mit Checkpoints (PRO Dashboard)
-- ============================================

-- Roadmap Phases (Admin-definiert)
CREATE TABLE IF NOT EXISTS roadmap_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  emoji TEXT DEFAULT '📍',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Roadmap Checkpoints (Admin-definiert)
CREATE TABLE IF NOT EXISTS roadmap_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id UUID NOT NULL REFERENCES roadmap_phases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  country_code TEXT, -- NULL = alle Länder, 'SE' = nur Schweden
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Progress
CREATE TABLE IF NOT EXISTS user_roadmap_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checkpoint_id UUID NOT NULL REFERENCES roadmap_checkpoints(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT, -- Optional: User kann Notizen hinzufügen
  UNIQUE(user_id, checkpoint_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_roadmap_phases_sort ON roadmap_phases(sort_order);
CREATE INDEX IF NOT EXISTS idx_roadmap_checkpoints_phase ON roadmap_checkpoints(phase_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_checkpoints_sort ON roadmap_checkpoints(phase_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_roadmap_progress(user_id);

-- RLS
ALTER TABLE roadmap_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roadmap_progress ENABLE ROW LEVEL SECURITY;

-- Phases/Checkpoints: Public read
CREATE POLICY "Anyone can read active phases" 
  ON roadmap_phases FOR SELECT 
  USING (is_active = TRUE);

CREATE POLICY "Anyone can read active checkpoints" 
  ON roadmap_checkpoints FOR SELECT 
  USING (is_active = TRUE);

-- Progress: User can read own
CREATE POLICY "Users can read own progress" 
  ON user_roadmap_progress FOR SELECT 
  USING (auth.uid() = user_id);

-- Progress: User can insert own
CREATE POLICY "Users can create own progress" 
  ON user_roadmap_progress FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Progress: User can delete own
CREATE POLICY "Users can delete own progress" 
  ON user_roadmap_progress FOR DELETE 
  USING (auth.uid() = user_id);

-- Comments
COMMENT ON TABLE roadmap_phases IS 'Auswanderungs-Fahrplan Phasen (z.B. Planung, Dokumente, Umzug)';
COMMENT ON TABLE roadmap_checkpoints IS 'Checkpoints innerhalb einer Phase';
COMMENT ON TABLE user_roadmap_progress IS 'Tracking welche Checkpoints ein User abgehakt hat';

