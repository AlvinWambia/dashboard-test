import React from 'react';
import { createAdminClient } from '@/supabase/server';
import { notFound } from 'next/navigation';
import { BuyNowButton } from '@/components/BuyNowButton';
import { ClipboardList, CreditCard, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default async function ProgramOnboardingPage({ params }) {
    const { id } = await params;
    const supabase = createAdminClient();
    const { data: program } = await supabase
        .from('programs')
        .select('*')
        .eq('id', id)
        .single();

    if (!program) {
        return notFound();
    }

    const isSession = program.service_type === 'session';

    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12">
                <div className="mb-8">
                    <Link href="/" className="text-sm text-slate-500 hover:text-black font-medium transition-colors">
                        &larr; Back to Home
                    </Link>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                    Get Started with {program.title}
                </h1>
                <p className="text-slate-500 text-lg mb-10">
                    {isSession 
                        ? "Just a few quick steps to set up your coaching session." 
                        : "Instant access to your program files right after checkout."}
                </p>

                <div className="space-y-8 mb-12 relative">
                    {/* Connecting line */}
                    <div className="absolute left-[1.3rem] top-8 bottom-8 w-0.5 bg-slate-100 -z-0"></div>

                    {/* Step 1: Form (only for sessions) */}
                    {isSession && (
                        <div className="flex gap-6 relative z-10">
                            <div className="w-11 h-11 shrink-0 rounded-full bg-black text-white flex items-center justify-center shadow-lg border-4 border-white">
                                <ClipboardList className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">1. Fill the Intake Form</h3>
                                <p className="text-slate-500 text-sm">
                                    We need to know your current fitness level, goals, and preferences so we can tailor your sessions.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Payment */}
                    <div className="flex gap-6 relative z-10">
                        <div className="w-11 h-11 shrink-0 rounded-full bg-black text-white flex items-center justify-center shadow-lg border-4 border-white">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">
                                {isSession ? '2. Secure Checkout' : '1. Secure Checkout'}
                            </h3>
                            <p className="text-slate-500 text-sm">
                                Complete your purchase securely via Paystack.
                            </p>
                        </div>
                    </div>

                    {/* Step 3: Access */}
                    <div className="flex gap-6 relative z-10">
                        <div className="w-11 h-11 shrink-0 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg border-4 border-white">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">
                                {isSession ? '3. Instant Access & Session Setup' : '2. Instant Download Access'}
                            </h3>
                            <p className="text-slate-500 text-sm">
                                {isSession 
                                    ? "Access your dashboard immediately to start your coaching sessions." 
                                    : "Get immediate access to download your digital guides right from your profile dashboard."}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100 flex justify-between items-center">
                    <div>
                        <p className="text-sm font-bold text-slate-900 uppercase tracking-wider">{program.title}</p>
                        <p className="text-2xl font-bold text-black mt-1">Kshs {program.price?.toLocaleString() || 0}</p>
                    </div>
                </div>

                <div className="w-full h-14">
                    {/* Re-use the existing BuyNowButton which creates the pending order and routes to the form */}
                    <BuyNowButton product={program} />
                </div>
            </div>
        </main>
    );
}
