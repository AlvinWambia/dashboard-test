import { createAdminClient } from "@/supabase/server";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";

// This route is called daily by Supabase pg_cron as a safety net.
// It finds subscriptions that are past their next_billing_date + grace period
// and verifies their real status against Paystack. If Paystack shows failed,
// it revokes the user's access.

const GRACE_PERIOD_HOURS = 48; // 2-day grace period

export async function GET(req) {
  // Rate limit: Max 10 requests per hour per IP
  const rateLimitError = checkRateLimit(req, {
    limit: 10,
    windowMs: 60 * 60 * 1000,
    keyPrefix: "cron-verify-subs",
  });
  if (rateLimitError) return rateLimitError;

  // Secure this endpoint with a secret token to prevent unauthorized calls
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.PAYSTACK_SECRET_KEY) {
    return NextResponse.json({ error: "Paystack key missing" }, { status: 500 });
  }

  const supabase = createAdminClient();
  const graceCutoff = new Date();
  graceCutoff.setHours(graceCutoff.getHours() - GRACE_PERIOD_HOURS);

  console.log(`[Cron] Running subscription verification. Grace cutoff: ${graceCutoff.toISOString()}`);

  // Find all subscriptions that appear active but have passed next_billing_date + grace period
  const { data: expiredCandidates, error } = await supabase
    .from("subscriptions")
    .select("id, client_id, paystack_subscription_code, next_billing_date, status")
    .eq("status", "active")
    .lt("next_billing_date", graceCutoff.toISOString());

  if (error) {
    console.error("[Cron] Error fetching candidates:", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  if (!expiredCandidates || expiredCandidates.length === 0) {
    console.log("[Cron] No expired candidates found.");
    return NextResponse.json({ checked: 0, revoked: 0 });
  }

  console.log(`[Cron] Found ${expiredCandidates.length} subscription(s) to verify.`);

  let revokedCount = 0;

  for (const sub of expiredCandidates) {
    try {
      // Ping Paystack to get the real subscription status
      const res = await fetch(`https://api.paystack.co/subscription/${sub.paystack_subscription_code}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      });

      const paystackData = await res.json();
      const realStatus = paystackData?.data?.status;

      console.log(`[Cron] Sub ${sub.paystack_subscription_code}: Paystack status = "${realStatus}"`);

      // If Paystack says it's NOT active, revoke local access
      if (realStatus && realStatus !== "active") {
        await supabase
          .from("subscriptions")
          .update({ status: realStatus === "cancelled" ? "cancelled" : "past_due" })
          .eq("id", sub.id);

        await supabase
          .from("client_programs")
          .update({ status: "expired" })
          .eq("client_id", sub.client_id)
          .eq("status", "active");

        console.log(`[Cron] Revoked access for client ${sub.client_id}.`);
        revokedCount++;
      }
    } catch (err) {
      console.error(`[Cron] Error verifying sub ${sub.paystack_subscription_code}:`, err);
    }
  }

  return NextResponse.json({
    checked: expiredCandidates.length,
    revoked: revokedCount,
    timestamp: new Date().toISOString(),
  });
}
