-- ============================================================
-- Program Types & Bookings Schema Migration
-- ============================================================
-- Run this SQL in the Supabase SQL Editor (Dashboard > SQL Editor)

-- 1. Add service_type and consultation_fee to programs
ALTER TABLE public.programs 
ADD COLUMN IF NOT EXISTS service_type TEXT NOT NULL DEFAULT 'downloadable',
ADD COLUMN IF NOT EXISTS consultation_fee NUMERIC NOT NULL DEFAULT 0;

-- 2. Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id TEXT REFERENCES public.programs(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes TEXT,
  consultation_paid BOOLEAN NOT NULL DEFAULT false,
  consultation_payment_ref TEXT,
  unlocked_purchase BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow users to view their own bookings
CREATE POLICY "Users can view own bookings" 
ON public.bookings FOR SELECT 
USING (auth.uid() = user_id);

-- Allow service role / admins full access
CREATE POLICY "Admins can view and edit all bookings" 
ON public.bookings FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
