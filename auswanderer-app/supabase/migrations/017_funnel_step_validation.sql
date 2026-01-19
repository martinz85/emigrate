-- =====================================================
-- Migration 017: Add SQL-level validation for funnel steps
-- =====================================================
-- Fixes SQL injection risk by validating step names in PostgreSQL
-- before executing dynamic SQL in increment_funnel_step

-- Drop and recreate the function with validation
CREATE OR REPLACE FUNCTION public.increment_funnel_step(
  p_date DATE,
  p_step TEXT,
  p_device TEXT DEFAULT 'desktop'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- SECURITY: Validate step name to prevent SQL injection
  -- Only allow known funnel step column names
  IF p_step NOT IN (
    'landing_views', 
    'analysis_started', 
    'pre_analysis_completed',
    'questions_halfway', 
    'questions_completed', 
    'teaser_viewed',
    'checkout_started', 
    'checkout_completed', 
    'pdf_downloaded',
    'abandoned_at_welcome', 
    'abandoned_at_pre_analysis',
    'abandoned_at_questions', 
    'abandoned_at_teaser', 
    'abandoned_at_checkout'
  ) THEN
    RAISE EXCEPTION 'Invalid funnel step: %. Allowed values: landing_views, analysis_started, pre_analysis_completed, questions_halfway, questions_completed, teaser_viewed, checkout_started, checkout_completed, pdf_downloaded, abandoned_at_welcome, abandoned_at_pre_analysis, abandoned_at_questions, abandoned_at_teaser, abandoned_at_checkout', p_step;
  END IF;

  -- Validate device type
  IF p_device NOT IN ('desktop', 'mobile', 'tablet') THEN
    RAISE EXCEPTION 'Invalid device type: %. Allowed values: desktop, mobile, tablet', p_device;
  END IF;

  -- Ensure row exists
  INSERT INTO public.funnel_daily (date)
  VALUES (p_date)
  ON CONFLICT (date) DO NOTHING;

  -- Increment the specific step (safe now because validated)
  EXECUTE format(
    'UPDATE public.funnel_daily SET %I = %I + 1, updated_at = NOW() WHERE date = $1',
    p_step, p_step
  ) USING p_date;

  -- Increment device counter
  IF p_device = 'mobile' THEN
    UPDATE public.funnel_daily SET mobile_sessions = mobile_sessions + 1 WHERE date = p_date;
  ELSIF p_device = 'tablet' THEN
    UPDATE public.funnel_daily SET tablet_sessions = tablet_sessions + 1 WHERE date = p_date;
  ELSE
    UPDATE public.funnel_daily SET desktop_sessions = desktop_sessions + 1 WHERE date = p_date;
  END IF;
END;
$$;

-- Add index for analysis_sessions.analysis_id (Nice-to-have from review)
CREATE INDEX IF NOT EXISTS idx_sessions_analysis_id 
  ON public.analysis_sessions(analysis_id) 
  WHERE analysis_id IS NOT NULL;

COMMENT ON FUNCTION public.increment_funnel_step IS 'Increments a funnel step counter for a given date. Validates step names to prevent SQL injection.';

