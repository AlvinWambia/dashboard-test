-- ============================================================
-- Fix: Widen the bookings RLS SELECT policy to also match
-- rows where customer_email = the logged-in user's email.
-- This covers bookings made as a guest (user_id = null).
--
-- Uses auth.email() — a built-in Supabase function that returns
-- the current user's email directly from the JWT. This avoids
-- querying public.profiles, which has no email column.
--
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

-- Drop the old narrow policy
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;

-- Re-create with OR: match by user_id OR by customer_email
CREATE POLICY "Users can view own bookings"
  ON public.bookings FOR SELECT
  USING (
    auth.uid() = user_id
    OR customer_email = auth.email()
  );
