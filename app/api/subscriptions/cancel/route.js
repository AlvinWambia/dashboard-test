import { createClient } from "@/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const supabase = await createClient();
    
    // 1. Verify Authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { subscription_id } = body; // Can be paystack_subscription_code or subscription UUID

    if (!subscription_id) {
      return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 });
    }

    // 2. Fetch subscription from DB (match either paystack_subscription_code or id)
    const { data: sub } = await supabase
      .from("subscriptions")
      .select('*')
      .or(`paystack_subscription_code.eq.${subscription_id},id.eq.${subscription_id}`)
      .eq('client_id', user.id)
      .maybeSingle();

    if (!sub) {
       return NextResponse.json({ error: "Subscription not found or unauthorized" }, { status: 404 });
    }

    const paystackCode = sub.paystack_subscription_code || subscription_id;

    // 3. Attempt Paystack API disable call if secret key is present
    if (process.env.PAYSTACK_SECRET_KEY && paystackCode) {
      try {
        const getSubRes = await fetch(`https://api.paystack.co/subscription/${paystackCode}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
          }
        });
        
        if (getSubRes.ok) {
          const subData = await getSubRes.json();
          const emailToken = subData?.data?.email_token;

          if (emailToken) {
            await fetch('https://api.paystack.co/subscription/disable', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                code: paystackCode,
                token: emailToken
              })
            });
          }
        }
      } catch (err) {
        console.error("Paystack API call failed during cancellation, updating local status:", err);
      }
    }

    // 4. Update Local DB Status to non-renewing
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({ status: 'non-renewing', updated_at: new Date().toISOString() })
      .eq('id', sub.id);

    if (updateError) {
      console.error("Error updating subscription status:", updateError);
      return NextResponse.json({ error: "Failed to update subscription status" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Subscription cancelled successfully" });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
