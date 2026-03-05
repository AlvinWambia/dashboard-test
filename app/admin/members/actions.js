'use server'

import { createClient } from '@/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addComment(formData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    const body = formData.get('body')
    if (!body || body.trim().length === 0) return { error: "Comment cannot be empty" }

    // In this context (Admin Dashboard), we treat user_id as the "target" or "owner" of the comment section.
    // We'll use the current user's ID for both user_id (target) and author_id (writer) effectively making this a personal admin log.
    // If you want this to be a shared team wall, you might use a fixed system ID for user_id.
    const { error } = await supabase.from('user_comments').insert({
        user_id: user.id,
        author_id: user.id,
        body: body,
    })

    if (error) return { error: error.message }

    revalidatePath('/admin/members')
    return { success: true }
}

export async function deleteComment(commentId) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    const { error } = await supabase.from('user_comments').delete().eq('id', commentId).eq('author_id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/admin/members')
    return { success: true }
}

export async function updateComment(formData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    const commentId = formData.get('commentId')
    const body = formData.get('body')

    const { error } = await supabase.from('user_comments').update({ body, updated_at: new Date().toISOString() }).eq('id', commentId).eq('author_id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/admin/members')
    return { success: true }
}