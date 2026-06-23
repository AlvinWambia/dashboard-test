'use server';

import { createClient } from '@/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addClientNote(clientFormId, note) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Verify user is an admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return { success: false, error: 'Unauthorized: Admin privileges required' };
  }

  const { data, error } = await supabase
    .from('client_notes')
    .insert({
      client_form_id: clientFormId,
      admin_id: user.id,
      note: note,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding client note:", error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/admin/clients/${clientFormId}`);
  return { success: true, data };
}
