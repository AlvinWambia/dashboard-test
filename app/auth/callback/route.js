// app/auth/callback/route.js
import { NextResponse } from 'next/server'
import { createClient } from '@/supabase/server' // Updated path to your server client

export async function GET(request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    // Extract the "next" parameter or default to /dashboard
    const next = requestUrl.searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            // Constructing a new URL using the request.url as a base ensures 
            // we stay on the same domain (Vercel) and keep our cookies.
            const response = NextResponse.redirect(new URL(next, request.url))

            // Example of setting a custom httpOnly cookie
            response.cookies.set('auth_verified', 'true', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 // 1 day
            })

            return response
        }
    }

    // Redirect to an error page if code exchange fails
    return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
}
