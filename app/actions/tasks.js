// app/actions/tasks.ts
'use server'
import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";

// Remove ": FormData" and "as string"
export async function addTask(formData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const title = formData.get("title");
    const description = formData.get("description");
    const priority = formData.get("priority");
    const due_date = formData.get("due_date") || null;
    const assigned_to = formData.get("assigned_to") || null;
    const new_status = "yet_to_do"; // New tasks default to this status

    // 1. Get the current number of tasks in the target status to determine the new position
    const { count, error: countError } = await supabase
        .from("admin_todos")
        .select('*', { count: 'exact', head: true })
        .eq('status', new_status);

    if (countError) {
        console.error("Error counting tasks for new position:", countError);
        return { error: countError.message };
    }

    const { error } = await supabase.from("admin_todos").insert([
        {
            title,
            description,
            priority,
            status: new_status,
            created_by: user.id,
            // Position will be 0-indexed, so count is the next available spot
            position: count,
            due_date: due_date,
            assigned_to: assigned_to,
        },
    ]);

    if (error) {
        console.error("Error adding task:", error);
        return { error: error.message };
    }

    revalidatePath("/admin/tasks");
    revalidatePath("/admin/dashboard");
    return { error: null };
}

export async function updateTaskStatus(taskId, newStatus) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('admin_todos')
        .update({ status: newStatus })
        .eq('id', taskId);

    if (error) {
        console.error("Error updating task status:", error.message);
        return { error: error.message };
    }

    revalidatePath('/admin/tasks');
    revalidatePath('/admin/dashboard');
    return { error: null };
}

export async function updateTaskOrder(updates) {
    const supabase = await createClient();

    // updates is an array of objects: [{ id: taskId, position: newIndex }]
    const { error } = await supabase.from("admin_todos").upsert(updates);

    if (error) {
        console.error("Error updating task order:", error.message);
        return { error: error.message };
    }

    // Revalidate the path to show the new order
    revalidatePath("/admin/tasks");
    revalidatePath("/admin/dashboard");
    return { error: null };
}

export async function deleteTask(taskId) {
    const supabase = await createClient();
    const { error } = await supabase.from('admin_todos').delete().eq('id', taskId);

    if (error) {
        console.error("Error deleting task:", error);
        return { error: error.message };
    }

    revalidatePath('/admin/tasks');
    revalidatePath('/admin/dashboard');
    return { error: null };
}

export async function updateTask(formData) {
    const supabase = await createClient();
    const id = formData.get('id');

    // Check if the task is already 'done'
    const { data: currentTask } = await supabase
        .from('admin_todos')
        .select('status')
        .eq('id', id)
        .single();

    if (currentTask?.status === 'done') {
        return { error: "Cannot edit a task that is marked as done." };
    }

    const title = formData.get('title');
    const description = formData.get('description');
    const priority = formData.get('priority');
    const status = formData.get('status');
    const due_date = formData.get('due_date') || null;
    const assigned_to = formData.get('assigned_to') || null;

    const { error } = await supabase
        .from('admin_todos')
        .update({ title, description, priority, status, due_date, assigned_to })
        .eq('id', id);

    if (error) {
        console.error("Error updating task:", error);
        return { error: error.message };
    }

    revalidatePath('/admin/tasks');
    revalidatePath('/admin/dashboard');
    return { error: null };
}