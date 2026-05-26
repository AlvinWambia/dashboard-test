import { Resend } from "resend";
import { NextResponse } from "next/server";
import { WelcomeEmailTemplate } from "@/components/emails/WelcomeEmailTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: "myfit <info@myfitraining.com>", // You might want to adjust the sender email based on verified domains
      to: email,
      subject: "Welcome to myfit!",
      react: WelcomeEmailTemplate({ name }),
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
