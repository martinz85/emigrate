-- Migration: 031_webhook_idempotency.sql
-- Story 7.2: E-Book Checkout - Webhook Idempotency
-- Description: Prevents duplicate processing of Stripe webhook events

-- ============================================
-- Webhook Events Table (Idempotency)
-- ============================================
CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY, -- Stripe event ID (e.g., evt_xxx)
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Optional: Store result/metadata
  status TEXT DEFAULT 'success', -- 'success', 'failed', 'skipped'
  error_message TEXT,
  
  -- Cleanup: Auto-delete old events after 30 days
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for cleanup job
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at);

-- RLS: No direct access from clients
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- No policies = no client access (service_role only)

-- ============================================
-- Cleanup Function (optional cron job)
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_old_webhook_events()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM webhook_events
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- ============================================
-- Comments
-- ============================================
COMMENT ON TABLE webhook_events IS 'Stores processed Stripe webhook event IDs for idempotency';
COMMENT ON COLUMN webhook_events.id IS 'Stripe event ID (evt_xxx) - ensures each event is processed only once';

