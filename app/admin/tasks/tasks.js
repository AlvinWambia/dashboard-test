"use server";

import { createServerClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateTaskStatus(taskId, newStatus) {
    const supabase = await createServerClient();

    const { error } = await supabase
        .from('admin_todos')
        .update({ status: newStatus })
        .eq('id', taskId);

    if (error) {
        console.error("Error updating task status:", error.message);
        return { error: error.message };
    }

    revalidatePath('/admin/tasks');
    return { error: null };
}


