import { Resend } from "resend";
import { NextResponse } from "next/server";
import { WelcomeEmailTemplate } from "@/components/emails/WelcomeEmailTemplate";
import { createClient } from "@/supabase/server";
import { checkRateLimit } from "@/lib/rateLimit";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  // Rate limit: Max 5 requests per 5 minutes per IP
  const rateLimitError = checkRateLimit(req, {
    limit: 5,
    windowMs: 5 * 60 * 1000,
    keyPrefix: "auth-welcome",
  });
  if (rateLimitError) return rateLimitError;

  try {
    // Auth Check: Ensure caller is authenticated or has valid user session
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { email, name } = await req.json();
    const targetEmail = email || user.email;

    if (!targetEmail) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: "myfit <info@myfitraining.com>",
      to: targetEmail,
      subject: "Welcome to myfit!",
      react: WelcomeEmailTemplate({ name: name || user.user_metadata?.full_name }),
    });

    if (error) {
      console.error("Resend Error sending welcome email:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("API Error sending welcome email:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
