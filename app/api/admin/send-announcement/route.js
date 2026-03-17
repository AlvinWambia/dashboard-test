import { createAdminClient } from "@/supabase/server";
import { Resend } from "resend";
import { NextResponse } from "next/server";
import { AdminEmailTemplate } from "@/components/emails/AdminEmailTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    // 1. Verify the caller is an authenticated admin
    const { createClient } = await import("@/supabase/server");
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createAdminClient();

    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin privileges required" },
        { status: 403 }
      );
    }

    // 2. Parse request body
    const { subject, html } = await req.json();

    if (!subject?.trim() || !html?.trim() || html === "<p></p>") {
      return NextResponse.json(
        { error: "Subject and message content are required." },
        { status: 400 }
      );
    }

    // 3. Collect all user emails (non-admin profiles only)
    const { data: { users: authUsers }, error: listError } =
      await adminSupabase.auth.admin.listUsers({ perPage: 1000 });

    if (listError) {
      console.error("Error listing users:", listError);
      return NextResponse.json(
        { error: "Failed to retrieve user list." },
        { status: 500 }
      );
    }

    // Filter out admins and users without emails
    const { data: adminProfiles } = await adminSupabase
      .from("profiles")
      .select("id")
      .eq("role", "admin");

    const adminIds = new Set((adminProfiles || []).map((p) => p.id));

    const recipientEmails = authUsers
      .filter((u) => u.email && !adminIds.has(u.id))
      .map((u) => u.email);

    if (recipientEmails.length === 0) {
      return NextResponse.json(
        { error: "No users to send to." },
        { status: 400 }
      );
    }

    // 4. Send via Resend batch API (max 100 per batch call)
    const BATCH_SIZE = 100;
    let totalSent = 0;

    for (let i = 0; i < recipientEmails.length; i += BATCH_SIZE) {
      const batch = recipientEmails.slice(i, i + BATCH_SIZE).map((email) => ({
        from: "myFit <onboarding@resend.dev>",
        to: [email],
        subject,
        react: AdminEmailTemplate({ subject, htmlContent: html }),
      }));

      const { error: batchError } = await resend.batch.send(batch);

      if (batchError) {
        console.error("Resend batch error:", batchError);
        return NextResponse.json(
          { error: "Failed to send emails: " + batchError.message },
          { status: 500 }
        );
      }

      totalSent += batch.length;
    }

    console.log(`Announcement sent to ${totalSent} users by admin:`, user.email);
    return NextResponse.json({ success: true, count: totalSent });
  } catch (err) {
    console.error("Announcement API error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
