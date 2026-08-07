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

export async function signOutAction() {
    try {
        const supabase = await createClient()
        await supabase.auth.signOut()
    } catch (e) {
        console.error('Server sign out error:', e)
    }

    try {
        const cookieStore = await cookies()
        cookieStore.delete('last_login_type')
        cookieStore.delete('auth_verified')
    } catch (e) {
        console.error('Error clearing cookies:', e)
    }
}