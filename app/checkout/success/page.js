import { CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient, createAdminClient } from "@/supabase/server";
import { Resend } from "resend";
import { NewsletterWelcomeTemplate } from "@/components/emails/NewsletterWelcomeTemplate";

export default async function SuccessPage({ searchParams }) {
  const params = await searchParams;
  const reference = params.reference || params.trxref || "Unknown";
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let orderData = null;
  let fetchError = null;
  let hasIntakeForm = false;
  let paymentVerified = false;

  if (user) {
    const { data: existingForm } = await supabase
      .from('client_intake_forms')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();
    
    hasIntakeForm = !!existingForm;
  }

  const actualOrderId = (reference !== "Unknown") 
    ? (reference.includes('_') ? reference.split('_')[0] : reference)
    : null;

  // 1. Verify transaction with Paystack API before displaying success
  if (reference && reference !== "Unknown" && process.env.PAYSTACK_SECRET_KEY) {
    try {
      const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        },
        cache: 'no-store'
      });
      const verifyJson = await verifyRes.json();
      if (verifyJson.status && verifyJson.data && verifyJson.data.status === 'success') {
        paymentVerified = true;

        // Fulfill order & send email if not already handled
        if (actualOrderId) {
          const adminSupabase = createAdminClient();
          const { data: order } = await adminSupabase
            .from('orders')
            .select('*')
            .eq('id', actualOrderId)
            .single();

          if (order) {
            orderData = order;
            if (order.status !== 'paid') {
              // Update order to paid
              await adminSupabase.from('orders').update({ status: 'paid' }).eq('id', actualOrderId);
              
              // Grant client program access
              await adminSupabase.from('client_programs').insert({
                client_id: order.user_id,
                program_id: order.program_id,
                status: 'active',
                review_status: 'approved'
              });

              // Send email using NewsletterWelcomeTemplate
              if (process.env.RESEND_API_KEY) {
                const resend = new Resend(process.env.RESEND_API_KEY);
                const recipientEmail = user?.email || verifyJson.data.customer?.email;
                const recipientName = user?.user_metadata?.full_name || recipientEmail?.split('@')[0] || "Member";
                if (recipientEmail) {
                  await resend.emails.send({
                    from: "myfit <info@myfitraining.com>",
                    to: recipientEmail,
                    subject: `Payment Successful! Welcome to ${order.program_name || "myfit"} 🎉`,
                    react: NewsletterWelcomeTemplate({ name: recipientName }),
                  }).catch(e => console.error("Error sending success email:", e));
                }
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Paystack API verification error:", err);
    }
  }

  // Fallback order fetch if not already loaded during verification
  if (!orderData && actualOrderId && actualOrderId.length > 20) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, program_name')
      .eq('id', actualOrderId)
      .single();
    
    orderData = data;
    fetchError = error;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-10 text-center">
        {fetchError && !paymentVerified ? (
          <AlertTriangle className="w-20 h-20 text-amber-500 mx-auto mb-6" />
        ) : (
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
        )}
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {fetchError && !paymentVerified ? "Order Lookup Issue" : "Payment Successful!"}
        </h1>
        
        <p className="text-gray-600 mb-8">
          {fetchError && !paymentVerified 
            ? "We couldn't find your order details, but your payment might still be processing. Check your email for confirmation."
            : `Thank you for your purchase${orderData?.program_name ? ` of ${orderData.program_name}` : ""}. We've sent a receipt and a welcome email to your inbox.`}
        </p>

        {fetchError && !paymentVerified && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm">
            Diagnostic: {fetchError.message}
          </div>
        )}

        <div className="bg-gray-50 rounded-2xl p-4 mb-8 text-left">
          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Transaction Reference</p>
          <p className="text-sm font-mono text-gray-800 break-all">{reference}</p>
        </div>

        {!hasIntakeForm && (
          <div className="mb-8">
            <p className="text-lg font-bold text-center">Click the button below to fill in the intake form to complete your onboarding.</p>
          </div>
        )}

        <div className="space-y-3">
          <Button asChild className="w-full py-6 rounded-2xl bg-black hover:bg-zinc-800 text-white font-medium text-base shadow-lg transition-all">
            <Link href="/profile">View Program</Link>
          </Button>
          {!hasIntakeForm && (
            <Button asChild variant="outline" className="w-full py-6 rounded-2xl border-slate-200 hover:bg-slate-50">
              <Link href={`/form?orderId=${actualOrderId}`}>Complete Intake Form</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
