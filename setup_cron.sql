-- ============================================================
-- Supabase pg_cron Setup for Daily Subscription Verification
-- ============================================================
-- Run this SQL in the Supabase SQL Editor (Dashboard > SQL Editor).
-- pg_cron is already enabled on all Supabase projects by default.
--
-- BEFORE RUNNING:
--   1. Add CRON_SECRET to your Vercel environment variables.
--      (Any long random string, e.g., generated via: openssl rand -hex 32)
--   2. Replace 'https://myfitraining.com' with your actual domain if different.
--   3. Replace 'YOUR_CRON_SECRET_HERE' with the same value you set in Vercel.

-- Schedule: Runs every day at 2:00 AM UTC
SELECT cron.schedule(
  'verify-subscriptions-daily',    -- Job name (unique identifier)
  '0 2 * * *',                     -- Cron expression: every day at 2am UTC
  $$
  SELECT
    net.http_get(
      url := 'https://myfitraining.com/api/cron/verify-subscriptions',
      headers := '{"Authorization": "Bearer YOUR_CRON_SECRET_HERE"}'::jsonb
    ) AS request_id;
  $$
);

-- To verify the job was created:
-- SELECT * FROM cron.job;

-- To unschedule/remove the job if needed:
-- SELECT cron.unschedule('verify-subscriptions-daily');

-- To check recent job run history:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

-- ============================================================
-- ALSO APPLY: Add next_billing_date column to subscriptions
-- (In case it doesn't exist yet)
-- ============================================================
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMP WITH TIME ZONE;

-- Add 'past_due' and 'non-renewing' to valid status values (informational, no constraint needed unless you have a CHECK):
-- If you have a CHECK constraint on status, add the new values:
-- ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
-- ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_status_check
--   CHECK (status IN ('active', 'non-renewing', 'past_due', 'cancelled', 'attention'));
