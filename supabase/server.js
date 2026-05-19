import { createServerClient, createBrowserClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = async () => {
  // In Next.js 15, cookies() is async. Awaiting it ensures compatibility
  // and allows the client to correctly read the PKCE code verifier.
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      },
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
