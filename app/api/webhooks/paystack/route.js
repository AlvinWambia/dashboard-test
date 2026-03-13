import { createAdminClient } from "@/supabase/server";
import { Resend } from "resend";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { AdminEmailTemplate } from "@/components/emails/AdminEmailTemplate";

// Initialize Resend lazily to prevent module evaluation errors if the key is missing
// ... (rest of imports/init)
let resend;
try {
  if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
} catch (e) {
  console.error("Resend initialization failed:", e);
}

export async function POST(req) {
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
    const reference = data.reference;
    const orderIdFromMetadata = data.metadata?.orderId;
    const orderIdFromReference = reference?.includes('_') ? reference.split('_')[0] : reference;
    const orderId = orderIdFromMetadata || orderIdFromReference;
    
    console.log("Extracted orderId:", orderId, "(from reference:", reference, ")");

    // 2. Handle the successful charge event
    if (event === "charge.success") {
      const reference = data.reference;
      const orderId = data.metadata?.orderId;
      const customerEmail = data.customer.email;
      const amountPaid = data.amount / 100; // Paystack sends amount in cents/subunits

      const supabase = createAdminClient();

      // 3. Fetch order details to get user_id, program_id, and program_name
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("user_id, program_id, program_name")
        .eq("id", orderId)
        .single();

      if (orderError || !order) {
        console.error("Error fetching order:", orderError);
        return new Response("Order not found", { status: 404 });
      }

      // 4. Update the order status in Supabase
      const { error: updateError } = await supabase
        .from("orders")
        .update({ status: "paid" })
        .eq("id", orderId);

      if (updateError) {
        console.error("Error updating order:", updateError);
        return new Response("Error updating order", { status: 500 });
      }

      // 5. Insert into payments table
      const { error: paymentError } = await supabase
        .from("payments")
        .insert({
          order_id: orderId,
          user_id: order.user_id,
          provider: "Paystack",
          provider_payment_id: reference,
          amount: amountPaid,
          currency: data.currency || "KES",
          status: "success"
        });

      if (paymentError) {
        console.error("Error creating payment record:", paymentError);
      }

      // 6. Grant program access
      const { error: accessError } = await supabase
        .from("program_access")
        .insert({
          user_id: order.user_id,
          program_id: order.program_id,
          order_id: orderId,
          access_type: "purchase"
        });

      if (accessError) {
        console.error("Error granting program access:", accessError);
      }

      // 7. Send the Welcome & Receipt Email via Resend
      if (resend) {
        const programName = order.program_name || "your program";
        const emailSubject = `Welcome to ${programName}!`;
        const emailHtml = `
          <p>Hi there,</p>
          <p>Thank you for purchasing <strong>${programName}</strong>! We've successfully received your payment of ${data.currency || "KES"} ${amountPaid.toFixed(2)}.</p>
          <p>We are thrilled to have you on board. Our team is already getting everything ready for you, and the administrator will contact you as soon as possible with the next steps.</p>
          <p>In the meantime, feel free to explore your dashboard.</p>
          <p>Best regards,<br/>The myFit Team</p>
        `;

        await resend.emails.send({
          from: "myFit <onboarding@resend.dev>", // Replace with your verified domain
          to: customerEmail,
          subject: emailSubject,
          react: AdminEmailTemplate({ subject: emailSubject, htmlContent: emailHtml }),
        });

        console.log("Welcome email sent via Resend.");
      } else {
        console.warn("Resend client not initialized, skipping emails.");
      }

      console.log(`Payment successful for Order ${orderId}. Emails sent and database updated.`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
