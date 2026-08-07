import { Resend } from "resend";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/supabase/server";
import MeetingScheduledTemplate from "@/components/emails/MeetingScheduledTemplate";
import { checkRateLimit } from "@/lib/rateLimit";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  // Rate limit: Max 60 webhook requests per minute per IP
  const rateLimitError = checkRateLimit(req, {
    limit: 60,
    windowMs: 60 * 1000,
    keyPrefix: "webhook-calendly",
  });
  if (rateLimitError) return rateLimitError;

  try {
    const body = await req.json();
    console.log("Calendly webhook received:", JSON.stringify(body, null, 2));

    const eventType = body.event;
    const payload = body.payload;

    if (!payload) {
      return NextResponse.json({ error: "No payload found" }, { status: 400 });
    }

    // Only process invitee.created (scheduled) events
    if (eventType !== "invitee.created" && eventType !== "invitee.scheduled") {
      return NextResponse.json({ message: `Ignoring event type: ${eventType}` }, { status: 200 });
    }

    const inviteeEmail = payload.email;
    const inviteeName = payload.name || "Member";
    const scheduledEvent = payload.scheduled_event || {};
    const startTimeStr = scheduledEvent.start_time; // UTC ISO string: e.g. "2026-07-30T14:30:00.000000Z"
    const endTimeStr = scheduledEvent.end_time;     // UTC ISO string: e.g. "2026-07-30T15:00:00.000000Z"
    const locationObj = scheduledEvent.location || {};

    if (!inviteeEmail || !startTimeStr) {
      return NextResponse.json({ error: "Missing required booking details" }, { status: 400 });
    }

    // 1. Resolve Google Meet or location URL
    let meetUrl = "https://meet.google.com";
    if (locationObj && typeof locationObj === "object") {
      meetUrl = locationObj.location || locationObj.join_url || meetUrl;
    } else if (typeof locationObj === "string" && locationObj.startsWith("http")) {
      meetUrl = locationObj;
    }

    // 2. Parse times (convert UTC ISO strings to local date & time strings for database)
    const startDate = new Date(startTimeStr);
    const endDate = new Date(endTimeStr);

    const scheduleDate = startDate.toISOString().split("T")[0]; // YYYY-MM-DD
    const scheduleStartTime = startDate.toISOString().split("T")[1].slice(0, 5); // HH:MM
    const scheduleEndTime = endDate.toISOString().split("T")[1].slice(0, 5);     // HH:MM

    // 3. Find client profile in database by email
    const supabase = createAdminClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", inviteeEmail)
      .maybeSingle();

    // 4. Save to admin_schedules
    const { error: dbError } = await supabase.from("admin_schedules").insert([
      {
        title: `Consultation: ${inviteeName}`,
        description: `Scheduled via Calendly. Join Meet: ${meetUrl}`,
        schedule_date: scheduleDate,
        start_time: scheduleStartTime,
        end_time: scheduleEndTime,
        type: "Meeting", // Auto-approved
        color: "bg-green-50 text-green-600",
        created_by: profile?.id || null,
      },
    ]);

    if (dbError) {
      console.error("Database insert error:", dbError);
      // Proceed to email even if database logging failed
    }

    // 5. Format dates for email template
    const formattedDate = startDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const formattedTime = startDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });

    // 6. Send template email via Resend
    if (process.env.RESEND_API_KEY) {
      const { error: resendError } = await resend.emails.send({
        from: "myFit <info@myfitraining.com>",
        to: [inviteeEmail],
        subject: "Your myFit Consultation is Scheduled! 🎉",
        react: MeetingScheduledTemplate({
          name: inviteeName,
          meetingDate: formattedDate,
          meetingTime: formattedTime,
          meetUrl,
        }),
      });

      if (resendError) {
        console.error("Resend error sending email:", resendError);
        return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
      }
    } else {
      console.warn("RESEND_API_KEY not configured. Skipping email notification.");
    }

    return NextResponse.json({ success: true, message: "Booking synced and email notification queued." }, { status: 200 });
  } catch (error) {
    console.error("Calendly webhook route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
