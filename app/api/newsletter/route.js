import { Resend } from "resend";
import { NextResponse } from "next/server";
import { NewsletterWelcomeTemplate } from "@/components/emails/NewsletterWelcomeTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { email } = await req.json();

    // Basic validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // Send the welcome email via Resend
    const { data, error: resendError } = await resend.emails.send({
      from: "myFit <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to the myFit Newsletter! 🎉",
      react: NewsletterWelcomeTemplate({ email }),
    });

    if (resendError) {
      console.error("Resend error:", resendError);
      return NextResponse.json(
        { error: "Failed to send email. Please try again." },
        { status: 500 }
      );
    }

    console.log("Newsletter email sent:", data);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Newsletter API error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
