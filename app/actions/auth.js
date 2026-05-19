'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/supabase/server'

export async function loginWithCookieAction(formData) {
    const email = formData.get('email')
    const password = formData.get('password')
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (!error) {
        const cookieStore = await cookies()

        // Setting a custom httpOnly cookie manually
        cookieStore.set('last_login_type', 'password', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        })
    }
}