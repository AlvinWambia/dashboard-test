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
        const supabase = await createClient();
        // Wrap in a 3-second timeout to prevent server action from hanging indefinitely
        // if the Supabase auth server is unresponsive or the session is corrupted.
        await Promise.race([
            supabase.auth.signOut(),
            new Promise((_, reject) => setTimeout(() => reject(new Error("SignOut timeout")), 3000))
        ]);
    } catch (e) {
        console.error('Server sign out error:', e);
    }

    try {
        const cookieStore = await cookies();
        cookieStore.delete('last_login_type');
        cookieStore.delete('auth_verified');
        
        // Force delete any Supabase cookies just in case the signOut call hung and failed to clear them
        const allCookies = cookieStore.getAll();
        allCookies.forEach(cookie => {
            if (cookie.name.startsWith('sb-')) {
                cookieStore.delete(cookie.name);
            }
        });
    } catch (e) {
        console.error('Error clearing cookies:', e);
    }
}