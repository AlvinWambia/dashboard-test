import { createClient } from "@/supabase/server";
import { notFound, redirect } from "next/navigation";
import CheckoutClient from "@/components/CheckoutClient";
import { CreditCard, ShieldCheck, Lock, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default async function CheckoutPage({ params }) {
    const { orderId } = await params;
    const supabase = await createClient();

    // Fetch the logged-in user to get their email
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/auth/login?redirect=/checkout/${orderId}`);
    }

    // Fetch order details
    const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

    // Verify IDOR ownership
    if (error || !order || order.user_id !== user.id) {
        console.error(`Unauthorized access for order ID ${orderId}.`);
        notFound();
    }

    let planCode = null;
    if (order && order.program_id) {
        const { data: programData } = await supabase
            .from('programs')
            .select('paystack_plan_code')
            .eq('id', order.program_id)
            .single();
        planCode = programData?.paystack_plan_code || null;
    }

    const formattedPrice = (typeof order.price === 'number' ? order.price : parseFloat(order.price) || 0)
        .toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden grid lg:grid-cols-12 gap-0">
                {/* Left Side: Order & Customer Information */}
                <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-8">
                    <div>
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
                            <span>Step 2 of 2</span>
                            <span>•</span>
                            <span className="text-black">Secure Checkout</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Complete Your Purchase</h1>
                        <p className="text-sm text-slate-500 mb-6">Review your customer account details and select your payment method.</p>

                        <div className="space-y-6">
                            {/* Account Details Box */}
                            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/60 space-y-3">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Account Details</h3>
                                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <Label className="text-xs text-slate-500">Full Name</Label>
                                        <Input
                                            readOnly
                                            value={user?.user_metadata?.full_name || "Customer"}
                                            className="bg-white/80 border-slate-200 mt-1 cursor-not-allowed text-slate-700 font-medium"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-slate-500">Email Address</Label>
                                        <Input
                                            readOnly
                                            value={user?.email || ""}
                                            className="bg-white/80 border-slate-200 mt-1 cursor-not-allowed text-slate-700 font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method Selector */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Payment Gateway</h3>
                                <div className="border-2 border-black rounded-2xl p-4 bg-slate-900 text-white flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                            <CreditCard className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">Paystack Checkout</p>
                                            <p className="text-xs text-slate-400">Supports M-Pesa, Visa, Mastercard & Cards</p>
                                        </div>
                                    </div>
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trust Badges Footer */}
                    <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-emerald-600" />
                            <span>256-Bit SSL Encrypted</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-blue-600" />
                            <span>Instant Access Guaranteed</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Order Summary Card */}
                <div className="lg:col-span-5 bg-slate-900 p-6 sm:p-10 text-white flex flex-col justify-between space-y-6">
                    <div>
                        <h2 className="text-xl font-bold mb-1">Order Summary</h2>
                        <p className="text-xs text-slate-400 mb-6">Review your order before proceeding to payment.</p>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                            <div>
                                <p className="text-xs text-slate-400 uppercase font-semibold">Program Selected</p>
                                <p className="text-lg font-bold text-white mt-1">{order.program_name || "Fitness Program"}</p>
                            </div>

                            <Separator className="bg-white/10" />

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-slate-300">
                                    <span>Subtotal</span>
                                    <span>KES {formattedPrice}</span>
                                </div>
                                <div className="flex justify-between text-slate-300">
                                    <span>Taxes & Fees</span>
                                    <span>KES 0.00</span>
                                </div>
                                <Separator className="bg-white/10 my-2" />
                                <div className="flex justify-between text-lg font-bold text-white pt-1">
                                    <span>Total Due</span>
                                    <span className="text-emerald-400">KES {formattedPrice}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <CheckoutClient 
                            email={user?.email || "customer@example.com"} 
                            amount={order.price} 
                            orderId={order.id}
                            planCode={planCode}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
