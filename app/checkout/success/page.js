import { CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/supabase/server";

export default async function SuccessPage({ searchParams }) {
  const params = await searchParams;
  const reference = params.reference || params.trxref || "Unknown";
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let orderData = null;
  let fetchError = null;
  let hasIntakeForm = false;

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

  if (actualOrderId && actualOrderId.length > 20) {
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
        {fetchError ? (
          <AlertTriangle className="w-20 h-20 text-amber-500 mx-auto mb-6" />
        ) : (
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
        )}
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {fetchError ? "Order Lookup Issue" : "Payment Successful!"}
        </h1>
        
        <p className="text-gray-600 mb-8">
          {fetchError 
            ? "We couldn't find your order details, but your payment might still be processing. Check your email for confirmation."
            : `Thank you for your purchase${orderData?.program_name ? ` of ${orderData.program_name}` : ""}. We've sent a receipt and a welcome email to your inbox.`}
        </p>

        {fetchError && (
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
            <p className="text-lg font-bold text-center">Click the button below to fill in the take-in form to successfully finish buying product.</p>
          </div>
        )}

        <div className="space-y-3">
          {hasIntakeForm ? (
            <Button asChild className="w-full py-6 rounded-2xl bg-black hover:bg-zinc-800">
              <Link href="/home2">Go to Dashboard</Link>
            </Button>
          ) : (
            <Button asChild className="w-full py-6 rounded-2xl bg-black hover:bg-zinc-800">
              <Link href={`/form?orderId=${actualOrderId}`}>Fill Intake Form</Link>
            </Button>
          )}
          <Button asChild variant="ghost" className="w-full py-6 rounded-2xl">
            <Link href="/home2">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
