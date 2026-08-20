import { createAdminClient } from "@/supabase/server";
import { Resend } from "resend";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { AdminEmailTemplate } from "@/components/emails/AdminEmailTemplate";
import { checkRateLimit } from "@/lib/rateLimit";

// Initialize Resend lazily to prevent module evaluation errors if the key is missing
let resend;
try {
  if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
} catch (e) {
  console.error("Resend initialization failed:", e);
}

const FROM_EMAIL = "myFit <info@myfitraining.com>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "info@myfitraining.com";

// ─── Helper: send email via Resend ──────────────────────────────────────────
async function sendEmail({ to, subject, htmlContent }) {
  if (!resend) {
    console.warn("Resend not initialized — skipping email to:", to);
    return;
  }
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      react: AdminEmailTemplate({ subject, htmlContent }),
    });
    console.log(`Email sent → ${to} | Subject: ${subject}`);
  } catch (err) {
    console.error("Email send failed:", err);
  }
}

// ─── Webhook Handler ─────────────────────────────────────────────────────────
export async function POST(req) {
  // Rate limit: Max 100 webhook requests per minute per IP
  const rateLimitError = checkRateLimit(req, {
    limit: 100,
    windowMs: 60 * 1000,
    keyPrefix: "webhook-paystack",
  });
  if (rateLimitError) return rateLimitError;

  console.log("--- Paystack Webhook Received ---");
  console.log("Time:", new Date().toISOString());

  if (!process.env.RESEND_API_KEY) {
    console.error("WEBHOOK ERROR: RESEND_API_KEY is missing in environment variables.");
  }

  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    console.log("Signature present:", !!signature);
    console.log("Secret Key present:", !!process.env.PAYSTACK_SECRET_KEY);

    if (!process.env.PAYSTACK_SECRET_KEY) {
      console.error("WEBHOOK ERROR: PAYSTACK_SECRET_KEY is missing in environment variables.");
      return new Response("Config error", { status: 500 });
    }

    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest("hex");

    // 1. Verify the signature
    if (hash !== signature) {
      console.error("WEBHOOK ERROR: Invalid signature.");
      console.log("Expected Hash:", hash);
      console.log("Received Signature:", signature);
      return new Response("Invalid signature", { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const event = body.event;
    const data = body.data;

    console.log("Webhook Event:", event);

    // ── charge.success ────────────────────────────────────────────────────
    if (event === "charge.success") {
      const customerEmail = data.customer.email;
      const amountPaid = data.amount / 100;
      const reference = data.reference;
      const currency = data.currency || "KES";
      const orderIdFromMetadata = data.metadata?.orderId;

      console.log("Extracted orderId from metadata:", orderIdFromMetadata, "(from reference:", reference, ")");

      const supabase = createAdminClient();

      if (orderIdFromMetadata) {
        // ── One-time order payment ─────────────────────────────────────────
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .select("id, status, user_id, program_id, program_name")
          .eq("id", orderIdFromMetadata)
          .single();

        if (orderError || !order) {
          console.error("Error fetching order:", orderError);
          return new Response("Order not found", { status: 404 });
        }

        // Idempotency check
        if (order.status === "paid") {
          console.log(`Order ${orderIdFromMetadata} already paid — returning 200 (idempotent).`);
          return NextResponse.json({ received: true, message: "Order already processed" }, { status: 200 });
        }

        // Update order status
        const { error: updateError } = await supabase
          .from("orders")
          .update({ status: "paid" })
          .eq("id", orderIdFromMetadata);

        if (updateError) {
          console.error("Error updating order:", updateError);
          return new Response("Error updating order", { status: 500 });
        }

        // Insert into payments table
        const { error: paymentError } = await supabase
          .from("payments")
          .insert({
            order_id: orderIdFromMetadata,
            user_id: order.user_id,
            provider: "Paystack",
            provider_payment_id: reference,
            amount: amountPaid,
            currency,
            status: "success",
          });

        if (paymentError) {
          console.error("Error creating payment record:", paymentError);
        }

        // Grant program access
        const { error: accessError } = await supabase
          .from("client_programs")
          .insert({
            client_id: order.user_id,
            program_id: order.program_id,
            status: "active",
            review_status: "approved",
          });

        if (accessError) {
          console.error("Error granting program access:", accessError);
        }

        const programName = order.program_name || "your program";

        // Customer: welcome + receipt email
        await sendEmail({
          to: customerEmail,
          subject: `Welcome to ${programName}! 🎉`,
          htmlContent: `
            <p>Hi there,</p>
            <p>Thank you for purchasing <strong>${programName}</strong>! We've successfully received your payment of <strong>${currency} ${amountPaid.toFixed(2)}</strong>.</p>
            <p>We are thrilled to have you on board. Our team is already getting everything ready for you, and the administrator will contact you as soon as possible with the next steps.</p>
            <p>In the meantime, feel free to <a href="${process.env.NEXT_PUBLIC_SITE_URL}/profile">explore your dashboard</a>.</p>
            <p>Best regards,<br/>The myFit Team</p>
          `,
        });

        // Admin: new payment alert
        await sendEmail({
          to: ADMIN_EMAIL,
          subject: `💳 New Payment — ${programName}`,
          htmlContent: `
            <p><strong>New payment received!</strong></p>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="padding:6px 0;color:#888;">Customer</td><td style="padding:6px 0;font-weight:600;">${customerEmail}</td></tr>
              <tr><td style="padding:6px 0;color:#888;">Program</td><td style="padding:6px 0;font-weight:600;">${programName}</td></tr>
              <tr><td style="padding:6px 0;color:#888;">Amount</td><td style="padding:6px 0;font-weight:600;">${currency} ${amountPaid.toFixed(2)}</td></tr>
              <tr><td style="padding:6px 0;color:#888;">Reference</td><td style="padding:6px 0;font-family:monospace;">${reference}</td></tr>
              <tr><td style="padding:6px 0;color:#888;">Order ID</td><td style="padding:6px 0;font-family:monospace;">${orderIdFromMetadata}</td></tr>
            </table>
            <p style="margin-top:16px;"><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/members" style="background:#000;color:#fff;padding:10px 20px;border-radius:20px;text-decoration:none;font-weight:600;">View in Admin →</a></p>
          `,
        });

        console.log(`One-time payment processed for Order ${orderIdFromMetadata}.`);
      } else {
        // ── Subscription renewal charge (M-Pesa re-prompt / card auto-debit) ──
        // No orderId in metadata means this is a recurring subscription payment.
        console.log(`Subscription renewal charge detected for ${customerEmail}`);

        const { data: userProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", customerEmail)
          .maybeSingle();

        if (userProfile) {
          // Reactivate any past_due or expired program access
          const { error: reactivateError } = await supabase
            .from("client_programs")
            .update({ status: "active" })
            .eq("client_id", userProfile.id)
            .in("status", ["past_due", "expired"]);

          if (reactivateError) {
            console.error("Error reactivating client_programs:", reactivateError);
          } else {
            console.log(`Reactivated program access for ${customerEmail}`);
          }

          // Update subscription next_billing_date when plan_code is present
          if (data.plan?.plan_code && data.paid_at) {
            const paidAt = new Date(data.paid_at);
            const nextBillingDate = new Date(paidAt.setMonth(paidAt.getMonth() + 1)).toISOString();
            await supabase
              .from("subscriptions")
              .update({ status: "active", next_billing_date: nextBillingDate, updated_at: new Date().toISOString() })
              .eq("client_id", userProfile.id)
              .eq("plan_code", data.plan.plan_code);
          }

          // Customer: renewal receipt
          await sendEmail({
            to: customerEmail,
            subject: "Your myFit subscription has been renewed ✅",
            htmlContent: `
              <p>Hi there,</p>
              <p>Your myFit subscription has been successfully renewed. Your payment of <strong>${currency} ${amountPaid.toFixed(2)}</strong> was received — your access continues uninterrupted.</p>
              <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/profile">View your dashboard →</a></p>
              <p>Best regards,<br/>The myFit Team</p>
            `,
          });
        } else {
          console.warn(`No profile found for renewal email: ${customerEmail}`);
        }
      }

    // ── subscription.create ───────────────────────────────────────────────
    } else if (event === "subscription.create") {
      const supabase = createAdminClient();
      const customerEmail = data.customer.email;

      const { data: userProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", customerEmail)
        .maybeSingle();

      if (userProfile) {
        await supabase.from("subscriptions").insert({
          client_id: userProfile.id,
          paystack_subscription_code: data.subscription_code,
          plan_code: data.plan?.plan_code || null,
          status: "active",
          next_billing_date: data.next_payment_date || null,
        });
        console.log(`Subscription created for ${customerEmail}`);
      }

    // ── subscription.disable ──────────────────────────────────────────────
    } else if (event === "subscription.disable") {
      const supabase = createAdminClient();
      await supabase
        .from("subscriptions")
        .update({ status: "non-renewing", updated_at: new Date().toISOString() })
        .eq("paystack_subscription_code", data.subscription_code);
      console.log(`Subscription ${data.subscription_code} disabled.`);

    // ── invoice.update (recurring charge success / upcoming charge notice) ─
    } else if (event === "invoice.update") {
      const supabase = createAdminClient();
      const subscriptionCode = data.subscription?.subscription_code || data.subscription_code;
      const nextPaymentDate = data.next_payment_date || null;
      const customerEmail = data.customer?.email;
      const amountPaid = (data.amount || 0) / 100;
      const currency = data.currency || "KES";

      console.log(`invoice.update for subscription ${subscriptionCode}`);

      if (subscriptionCode) {
        // Update next_billing_date and ensure status is active
        const { data: updatedSub } = await supabase
          .from("subscriptions")
          .update({
            status: "active",
            next_billing_date: nextPaymentDate,
            updated_at: new Date().toISOString(),
          })
          .eq("paystack_subscription_code", subscriptionCode)
          .select("client_id")
          .maybeSingle();

        console.log(`Updated next_billing_date to ${nextPaymentDate} for subscription ${subscriptionCode}`);

        // Safety net: reactivate access if it was suspended
        if (updatedSub?.client_id) {
          await supabase
            .from("client_programs")
            .update({ status: "active" })
            .eq("client_id", updatedSub.client_id)
            .in("status", ["past_due", "expired"]);
        }
      }

      // Recurring payment receipt / upcoming billing notice to customer
      if (customerEmail) {
        const formattedDate = nextPaymentDate
          ? new Date(nextPaymentDate).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })
          : "next month";

        const subject = amountPaid > 0
          ? "Your myFit subscription payment was processed ✅"
          : `Upcoming myFit billing on ${formattedDate}`;

        const htmlContent = amountPaid > 0
          ? `
            <p>Hi there,</p>
            <p>Your monthly myFit subscription payment of <strong>${currency} ${amountPaid.toFixed(2)}</strong> has been successfully processed.</p>
            <p><strong>Next billing date:</strong> ${formattedDate}</p>
            <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/profile">View your dashboard →</a></p>
            <p>Best regards,<br/>The myFit Team</p>
          `
          : `
            <p>Hi there,</p>
            <p>Just a reminder that your myFit subscription will be renewed on <strong>${formattedDate}</strong>.</p>
            <p>No action is needed — your payment method will be charged automatically.</p>
            <p>If you wish to make changes, visit your <a href="${process.env.NEXT_PUBLIC_SITE_URL}/profile">dashboard</a>.</p>
            <p>Best regards,<br/>The myFit Team</p>
          `;

        await sendEmail({ to: customerEmail, subject, htmlContent });
      }

    // ── invoice.payment_failed ────────────────────────────────────────────
    } else if (event === "invoice.payment_failed") {
      const supabase = createAdminClient();
      const subscriptionCode = data.subscription?.subscription_code;
      const customerEmail = data.customer?.email;
      const amountAttempted = (data.amount || 0) / 100;
      const currency = data.currency || "KES";

      // Mark subscription as past_due
      const { data: sub } = await supabase
        .from("subscriptions")
        .update({ status: "past_due", updated_at: new Date().toISOString() })
        .eq("paystack_subscription_code", subscriptionCode)
        .select("client_id")
        .maybeSingle();

      if (sub?.client_id) {
        // Revoke program access
        await supabase
          .from("client_programs")
          .update({ status: "expired" })
          .eq("client_id", sub.client_id)
          .eq("status", "active");

        console.log(`Access revoked for client ${sub.client_id} due to payment failure.`);
      }

      // Customer: payment failed email with renewal CTA
      if (customerEmail) {
        await sendEmail({
          to: customerEmail,
          subject: "Action required — myFit payment failed ⚠️",
          htmlContent: `
            <p>Hi there,</p>
            <p>We were unable to process your myFit subscription payment of <strong>${currency} ${amountAttempted.toFixed(2)}</strong>.</p>
            <p>Your access has been temporarily suspended. To restore it, please renew your subscription from your dashboard.</p>
            <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/profile" style="background:#000;color:#fff;padding:10px 20px;border-radius:20px;text-decoration:none;font-weight:600;">Renew Subscription →</a></p>
            <p>If you have any questions, reply to this email and we'll help you out.</p>
            <p>Best regards,<br/>The myFit Team</p>
          `,
        });
      }

      // Admin: payment failure alert
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `⚠️ Payment Failed — ${customerEmail || "Unknown customer"}`,
        htmlContent: `
          <p><strong>A subscription payment has failed.</strong></p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:6px 0;color:#888;">Customer</td><td style="padding:6px 0;font-weight:600;">${customerEmail || "N/A"}</td></tr>
            <tr><td style="padding:6px 0;color:#888;">Amount Attempted</td><td style="padding:6px 0;font-weight:600;">${currency} ${amountAttempted.toFixed(2)}</td></tr>
            <tr><td style="padding:6px 0;color:#888;">Subscription</td><td style="padding:6px 0;font-family:monospace;">${subscriptionCode || "N/A"}</td></tr>
          </table>
          <p style="color:#dc2626;font-size:13px;">Access has been revoked. The customer has been notified to renew.</p>
          <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/members" style="background:#dc2626;color:#fff;padding:10px 20px;border-radius:20px;text-decoration:none;font-weight:600;">View in Admin →</a></p>
        `,
      });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
