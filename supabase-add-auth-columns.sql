-- ============================================================
-- PickMyPath — Add Auth Columns Migration
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- This adds email verification and password reset support.
-- ============================================================

-- Add email verification columns to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email_verified       boolean     DEFAULT false,
  ADD COLUMN IF NOT EXISTS verify_token         text,
  ADD COLUMN IF NOT EXISTS verify_token_expiry  timestamptz,
  ADD COLUMN IF NOT EXISTS reset_token          text,
  ADD COLUMN IF NOT EXISTS reset_token_expiry   timestamptz;

-- Add assessment progress tracking
-- Stores the last question index the user reached (for resume)
ALTER TABLE assessments
  ADD COLUMN IF NOT EXISTS last_question_index  int DEFAULT 0;

-- Confirm
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('email_verified','verify_token','reset_token')
ORDER BY column_name;
