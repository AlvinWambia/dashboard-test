-- ============================================================
-- Missing Columns Migration for programs table
-- ============================================================
-- Run this entire script in the Supabase Dashboard:
--   Dashboard → SQL Editor → New Query → paste & Run
--
-- All statements use IF NOT EXISTS so it is safe to re-run.
-- ============================================================

-- Deliverables / session-type feature flags
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS has_digital_downloads    BOOLEAN DEFAULT false;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS has_dashboard_access     BOOLEAN DEFAULT false;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS has_online_consultations BOOLEAN DEFAULT false;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS has_online_one_on_one    BOOLEAN DEFAULT false;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS has_online_group         BOOLEAN DEFAULT false;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS has_physical_sessions    BOOLEAN DEFAULT false;

-- Booking / location fields
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS booking_url       TEXT;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS location_details  TEXT;

-- Payment type ('subscription' | 'one_time')
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'subscription';

-- Service type ('downloadable' | 'session')
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS service_type TEXT DEFAULT 'downloadable';

-- Consultation fee (one-time charge before full program purchase)
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS consultation_fee NUMERIC DEFAULT 0;

-- FAQs (JSONB array)
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT '[]'::jsonb;

-- Billing interval for subscription programs
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS billing_interval TEXT DEFAULT 'monthly';

-- Price
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;

-- Updated at timestamp
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- ============================================================
-- Bookings table (needed for consultation booking feature)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id               TEXT REFERENCES public.programs(id) ON DELETE SET NULL,
  user_id                  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_email           TEXT,
  customer_name            TEXT,
  status                   TEXT NOT NULL DEFAULT 'pending',
  notes                    TEXT,
  consultation_paid        BOOLEAN NOT NULL DEFAULT false,
  consultation_payment_ref TEXT,
  unlocked_purchase        BOOLEAN NOT NULL DEFAULT false,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Users can view their own bookings
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'bookings'
      AND policyname = 'Users can view own bookings'
  ) THEN
    CREATE POLICY "Users can view own bookings"
      ON public.bookings FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Admins can view and edit all bookings
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'bookings'
      AND policyname = 'Admins can view and edit all bookings'
  ) THEN
    CREATE POLICY "Admins can view and edit all bookings"
      ON public.bookings FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

-- Allow inserting bookings (service role / guests via API)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'bookings'
      AND policyname = 'Anyone can insert bookings'
  ) THEN
    CREATE POLICY "Anyone can insert bookings"
      ON public.bookings FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- ============================================================
-- Verify the columns were added successfully
-- ============================================================
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'programs'
  AND column_name IN (
    'has_digital_downloads',
    'has_dashboard_access',
    'has_online_consultations',
    'has_online_one_on_one',
    'has_online_group',
    'has_physical_sessions',
    'booking_url',
    'location_details',
    'payment_type',
    'service_type',
    'consultation_fee',
    'faqs',
    'billing_interval',
    'price'
  )
ORDER BY column_name;
