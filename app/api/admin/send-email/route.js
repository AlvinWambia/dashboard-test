import { createAdminClient } from "@/supabase/server";
import { Resend } from "resend";
import { NextResponse } from "next/server";
import { AdminEmailTemplate } from "@/components/emails/AdminEmailTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  console.log("--- Admin Send Email API Hit ---");
  try {
    const supabase = createAdminClient();

    // 1. Verify admin session
    console.log("Verifying admin session...");
    const { data: { user }, error: authError } = await (await import("@/supabase/server")).createClient().then(c => c.auth.getUser());

    if (authError || !user) {
      console.error("Auth error or no user:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("User authenticated:", user.email);

    // Checking if the user is an admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    console.log("User role profile:", profile);

    if (!profile || profile.role !== 'admin') {
      console.error("Unauthorized: Admin privileges required");
      return NextResponse.json({ error: "Unauthorized: Admin privileges required" }, { status: 403 });
    }

    // 2. Parse request body
    const { to, subject, html } = await req.json();
    console.log("Request body:", { to, subject, htmlLength: html?.length });

    if (!to || !subject || !html) {
      console.error("Missing required fields");
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 3. Send email via Resend
    console.log("Attempting to send email via Resend to:", to);
    const { data, error: resendError } = await resend.emails.send({
      from: "Admin <onboarding@resend.dev>",
      to: to,
      subject: subject,
      react: AdminEmailTemplate({ subject, htmlContent: html }),
    });

    if (resendError) {
      console.error("Resend Error:", resendError);
      return NextResponse.json({ error: resendError.message }, { status: 500 });
    }

    console.log("Email sent successfully via Resend:", data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
