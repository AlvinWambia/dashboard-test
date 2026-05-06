// app/auth/callback/route.js
import { NextResponse } from 'next/server'
import { createClient } from '@/supabase/server' // Updated path to your server client
import { getURL } from '@/lib/getURL'

export async function GET(request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // Extract the "next" parameter or default to /dashboard
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return NextResponse.redirect(getURL(next))
        }
    }

    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
