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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8 sm:p-10 text-center">
          {fetchError && !paymentVerified ? (
            <div className="mx-auto w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-12 h-12 text-amber-500" />
            </div>
          ) : (
            <div className="mx-auto w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
          )}
          
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
            {fetchError && !paymentVerified ? "Payment Processing" : "Payment Successful!"}
          </h1>
          
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            {fetchError && !paymentVerified 
              ? "We couldn't immediately verify your order details, but your payment might still be processing. Check your email for confirmation."
              : `Thank you for your purchase${orderData?.program_name ? ` of ${orderData.program_name}` : ""}. We've sent a receipt and a welcome email to your inbox.`}
          </p>

          {fetchError && !paymentVerified && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm text-left border border-red-100">
              <span className="font-semibold block mb-1">Diagnostic:</span> {fetchError.message}
            </div>
          )}

          {/* Transaction Details (Receipt) */}
          <div className="bg-gray-50/50 rounded-2xl p-5 mb-8 text-left border border-gray-100 space-y-4">
            <h3 className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Transaction Summary</h3>
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <span className="text-gray-500 text-sm">Status</span>
              <span className="font-medium text-green-600 text-sm px-2 py-0.5 bg-green-50 rounded-md">Paid</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <span className="text-gray-500 text-sm">Reference</span>
              <span className="font-mono text-sm text-gray-800 break-all w-1/2 text-right">{reference}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Date</span>
              <span className="text-sm text-gray-800">{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {!hasIntakeForm && (
            <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-4 text-left">
              <p className="text-sm text-blue-800 font-medium mb-1">One last step!</p>
              <p className="text-xs text-blue-600">Please complete your intake form so we can personalize your experience.</p>
            </div>
          )}

          <div className="space-y-3">
            {!hasIntakeForm ? (
              <>
                <Button asChild className="w-full py-6 rounded-xl bg-black hover:bg-zinc-800 text-white font-semibold text-base shadow-lg shadow-zinc-200 transition-all">
                  <Link href={`/form?orderId=${actualOrderId}`}>Complete Intake Form</Link>
                </Button>
                <Button asChild variant="ghost" className="w-full py-6 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-medium">
                  <Link href="/profile">Skip to Dashboard</Link>
                </Button>
              </>
            ) : (
              <Button asChild className="w-full py-6 rounded-xl bg-black hover:bg-zinc-800 text-white font-semibold text-base shadow-lg shadow-zinc-200 transition-all">
                <Link href="/profile">Go to Dashboard</Link>
              </Button>
            )}
          </div>
        </div>
        
        {/* Support Footer */}
        <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Need help with your order? <Link href="mailto:support@myfitraining.com" className="font-medium text-black hover:underline">Contact Support</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

