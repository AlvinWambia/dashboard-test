import { Resend } from "resend";
import { NextResponse } from "next/server";
import { NewsletterWelcomeTemplate } from "@/components/emails/NewsletterWelcomeTemplate";
import { checkRateLimit } from "@/lib/rateLimit";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  // Rate limit: Max 5 requests per 10 minutes per IP
  const rateLimitError = checkRateLimit(req, {
    limit: 5,
    windowMs: 10 * 60 * 1000,
    keyPrefix: "newsletter",
  });
  if (rateLimitError) return rateLimitError;

  try {
    const { name, email } = await req.json();

    // Basic validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // Send the welcome email via Resend
    const { data, error: resendError } = await resend.emails.send({
      from: "myFit <info@myfitraining.com>",
      to: [email],
      subject: "Welcome to the myFit Newsletter! 🎉",
      react: NewsletterWelcomeTemplate({ name, email }),
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
