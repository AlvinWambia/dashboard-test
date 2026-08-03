'use server'

import { createClient } from "@/supabase/server";
import { createAdminClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import MeetingScheduledTemplate from "@/components/emails/MeetingScheduledTemplate";

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

export async function checkAvailability(date, time) {
    const supabase = await createClient();

    const { data: schedules, error } = await supabase
        .from('admin_schedules')
        .select('id')
        .eq('schedule_date', date)
        .eq('start_time', time);

    if (error) {
        console.error("Error checking availability:", error);
        return { available: false, error: error.message };
    }

    return { available: schedules.length === 0 };
}

/**
 * Approves a pending meeting request, updates the schedule to confirmed,
 * and sends a Google Meet confirmation email to the client.
 *
 * @param {string} scheduleId - The ID of the admin_schedules row to approve.
 * @param {string} meetUrl    - The Google Meet URL to share with the client.
 */
export async function approveMeetingRequest(scheduleId, meetUrl) {
    const supabase = createAdminClient();

    // 1. Fetch the schedule so we know the date, time, and who requested it
    const { data: schedule, error: fetchError } = await supabase
        .from('admin_schedules')
        .select('*')
        .eq('id', scheduleId)
        .single();

    if (fetchError || !schedule) {
        console.error("Error fetching schedule:", fetchError);
        return { error: "Meeting not found." };
    }

    const resolvedMeetUrl = meetUrl?.trim() || "https://meet.google.com";
    const descriptionWithMeet = `Approved meeting. Google Meet: ${resolvedMeetUrl}`;

    // 2. Update the schedule: mark as approved Meeting
    const { error: updateError } = await supabase
        .from('admin_schedules')
        .update({
            type: 'Meeting',
            color: 'bg-green-50 text-green-600',
            description: descriptionWithMeet,
        })
        .eq('id', scheduleId);

    if (updateError) {
        console.error("Error approving meeting:", updateError);
        return { error: updateError.message };
    }

    // 3. Email the client their confirmation + meet link
    if (schedule.created_by && process.env.RESEND_API_KEY) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', schedule.created_by)
            .maybeSingle();

        if (profile?.email) {
            try {
                const resend = new Resend(process.env.RESEND_API_KEY);
                const clientName = profile.full_name?.split(' ')[0] || 'Member';

                // Format date & time for the email
                const timeStr = schedule.start_time ? `${schedule.schedule_date}T${schedule.start_time}:00` : schedule.schedule_date;
                const startDate = new Date(timeStr);
                const formattedDate = startDate.toLocaleDateString('en-US', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                });
                const formattedTime = schedule.start_time
                    ? new Date(`1970-01-01T${schedule.start_time}:00`).toLocaleTimeString('en-US', {
                        hour: '2-digit', minute: '2-digit',
                    })
                    : 'TBD';

                await resend.emails.send({
                    from: 'myFit <info@myfitraining.com>',
                    to: profile.email,
                    subject: 'Your myFit Consultation is Confirmed! 🎉',
                    react: MeetingScheduledTemplate({
                        name: clientName,
                        meetingDate: formattedDate,
                        meetingTime: formattedTime,
                        meetUrl: resolvedMeetUrl,
                    }),
                });
            } catch (emailError) {
                // Non-fatal: approval still succeeds even if email fails
                console.error("Error sending meeting confirmation email:", emailError);
            }
        }
    }

    revalidatePath("/admin/calendar");
    revalidatePath("/admin/requests");
    return { success: true };
}
