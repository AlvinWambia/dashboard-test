'use server'

import { createClient } from '@/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Deletes a user from Supabase Auth. This requires admin privileges.
 * @param {string} userId - The ID of the user to delete.
 */
export async function deleteUser(userId) {
    const supabase = createClient()

    const { error } = await supabase.auth.admin.deleteUser(userId)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/members')
    return { success: true }
}