'use server'

import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";

export async function addSchedule(formData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const title = formData.get("title");
    const description = formData.get("description");
    const schedule_date = formData.get("schedule_date");
    const start_time = formData.get("start_time") || null;
    const end_time = formData.get("end_time") || null;
    const type = formData.get("type") || 'event';
    const color = formData.get("color");

    const { error } = await supabase.from("admin_schedules").insert([
        {
            title,
            description,
            schedule_date,
            start_time,
            end_time,
            type,
            color,
            created_by: user.id,
        },
    ]);

    if (error) {
        console.error("Error adding schedule:", error);
        return { error: error.message };
    }

    revalidatePath("/admin/calendar");
    return { error: null };
}

export async function addWeeklyPin(formData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const title = formData.get("title");
    const description = formData.get("description");
    const day_of_week = formData.get("day_of_week");

    const { error } = await supabase.from("weekly_pins").insert([
        {
            title,
            description,
            day_of_week: parseInt(day_of_week),
            created_by: user.id,
        },
    ]);

    if (error) {
        console.error("Error adding weekly pin:", error);
        return { error: error.message };
    }

    revalidatePath("/admin/calendar");
    return { error: null };
}

export async function deleteWeeklyPin(pinId) {
    const supabase = await createClient();
    const { error } = await supabase.from('weekly_pins').delete().eq('id', pinId);

    if (error) {
        console.error("Error deleting weekly pin:", error);
        return { error: error.message };
    }

    revalidatePath("/admin/calendar");
    return { error: null };
}

export async function deleteSchedule(scheduleId) {
    const supabase = await createClient();
    const { error } = await supabase.from('admin_schedules').delete().eq('id', scheduleId);

    if (error) {
        console.error("Error deleting schedule:", error);
        return { error: error.message };
    }

    revalidatePath("/admin/calendar");
    return { error: null };
}

export async function updateWeeklyPin(formData) {
    const supabase = await createClient();
    const id = formData.get('id');
    const title = formData.get("title");
    const description = formData.get("description");
    const day_of_week = formData.get("day_of_week");

    const { error } = await supabase.from("weekly_pins").update({
        title,
        description,
        day_of_week: parseInt(day_of_week),
    }).eq('id', id);

    if (error) {
        console.error("Error updating weekly pin:", error);
        return { error: error.message };
    }

    revalidatePath("/admin/calendar");
    return { error: null };
}
