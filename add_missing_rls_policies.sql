-- Allow clients to delete their own program access
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'client_programs'
      AND policyname = 'Clients can delete their own program access'
  ) THEN
    CREATE POLICY "Clients can delete their own program access"
      ON public.client_programs FOR DELETE
      USING (client_id = auth.uid()::text);
  END IF;
END $$;

-- Allow clients to update their own subscriptions
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'subscriptions'
      AND policyname = 'Clients can update their own subscriptions'
  ) THEN
    CREATE POLICY "Clients can update their own subscriptions"
      ON public.subscriptions FOR UPDATE
      USING (client_id = auth.uid()::text);
  END IF;
END $$;
