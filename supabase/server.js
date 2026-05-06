import { createServerClient, createBrowserClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = () => {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch { /* Handle server component restriction */ }
        },
      },
    }
  )
}


/**
 * createAdminClient
 * 
 * Creates a Supabase client using the service role key.
 * Use this ONLY for server-side operations that need to bypass RLS,
 * like webhooks or admin actions.
 */
export function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { cookies: {} } // Admin client usually doesn't need to manage user cookies
  );
}
