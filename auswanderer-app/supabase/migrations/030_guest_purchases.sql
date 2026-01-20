-- Migration: 030_guest_purchases.sql
-- Story 7.2: E-Book Checkout - Guest Purchase Support
-- Description: Stores e-book purchases for guests (users who haven't created an account yet)
--              Allows users to claim their purchases when they create an account with the same email

-- ============================================
-- Guest Purchases Table
-- ============================================
CREATE TABLE IF NOT EXISTS guest_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ebook_id UUID NOT NULL REFERENCES ebooks(id) ON DELETE RESTRICT,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  stripe_session_id TEXT,
  stripe_payment_id TEXT,
  amount INTEGER, -- in cents
  
  -- Claim tracking
  claimed_at TIMESTAMPTZ,
  claimed_by UUID REFERENCES auth.users(id),
  
  -- Prevent duplicate claims
  UNIQUE(email, ebook_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_guest_purchases_email ON guest_purchases(email);
CREATE INDEX IF NOT EXISTS idx_guest_purchases_unclaimed ON guest_purchases(email) WHERE claimed_at IS NULL;

-- RLS
ALTER TABLE guest_purchases ENABLE ROW LEVEL SECURITY;

-- Only admins can view guest purchases (for support)
CREATE POLICY "Admins can view guest purchases"
  ON guest_purchases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Service role can insert (from webhook)
-- No policy needed - service_role bypasses RLS

-- ============================================
-- Function to claim guest purchases
-- Called when a user signs up or logs in
-- ============================================
CREATE OR REPLACE FUNCTION public.claim_guest_purchases()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  guest_purchase RECORD;
  user_email TEXT;
BEGIN
  -- Get the user's email
  SELECT email INTO user_email FROM auth.users WHERE id = NEW.id;
  
  IF user_email IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Find and claim all unclaimed purchases for this email
  FOR guest_purchase IN 
    SELECT * FROM guest_purchases 
    WHERE email = user_email 
    AND claimed_at IS NULL
  LOOP
    -- Insert into user_ebooks
    INSERT INTO user_ebooks (user_id, ebook_id, purchased_at, stripe_session_id, stripe_payment_id, amount)
    VALUES (
      NEW.id,
      guest_purchase.ebook_id,
      guest_purchase.purchased_at,
      guest_purchase.stripe_session_id,
      guest_purchase.stripe_payment_id,
      guest_purchase.amount
    )
    ON CONFLICT (user_id, ebook_id) DO NOTHING;
    
    -- Mark as claimed
    UPDATE guest_purchases
    SET claimed_at = NOW(), claimed_by = NEW.id
    WHERE id = guest_purchase.id;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Trigger on profile creation (new user)
DROP TRIGGER IF EXISTS claim_guest_purchases_on_signup ON profiles;
CREATE TRIGGER claim_guest_purchases_on_signup
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.claim_guest_purchases();

-- ============================================
-- Comments
-- ============================================
COMMENT ON TABLE guest_purchases IS 'Stores e-book purchases for guests who havent created an account yet';
COMMENT ON COLUMN guest_purchases.claimed_at IS 'When the purchase was claimed by a registered user';
COMMENT ON COLUMN guest_purchases.claimed_by IS 'User ID who claimed this purchase';

