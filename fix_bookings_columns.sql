-- ============================================================
-- Fix: Add missing columns to bookings table
-- Run in Supabase Dashboard → SQL Editor
-- All statements use IF NOT EXISTS so it is safe to re-run.
-- ============================================================

-- Core customer info columns (from supabase_missing_columns_migration.sql)
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS customer_email           TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS customer_name            TEXT;

-- Follow-up booking columns (from followup_booking_migration.sql)
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS customer_phone           TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS parent_booking_id        UUID REFERENCES public.bookings(id);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS consultation_round       INTEGER DEFAULT 1;

-- Programs: follow-up fee
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS followup_fee             NUMERIC DEFAULT 0;

-- ============================================================
-- Verify: confirm all expected columns exist
-- ============================================================
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'bookings'
  AND column_name IN (
    'customer_email',
    'customer_name',
    'customer_phone',
    'parent_booking_id',
    'consultation_round'
  )
ORDER BY column_name;
