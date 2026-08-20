"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Star, AlertTriangle, ArrowLeft, RefreshCcw, BookOpen, Download, Clock, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";

const BookingModal = dynamic(() => import("@/components/BookingModal"), { ssr: false });

export default function ProfileClient({ profile, user, purchasedPrograms = [], reviews = [], subscriptions = [], userBookings = [], fetchError = null }) {
    const router = useRouter();
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isCancelOpen, setIsCancelOpen] = useState(false);
    const [bookingModalState, setBookingModalState] = useState({ isOpen: false, program: null, mode: 'initial', parentBookingId: null, consultationRound: 1 });
    const [schedulingBookingId, setSchedulingBookingId] = useState(null);
    const [isSchedulingOpen, setIsSchedulingOpen] = useState(false);
    const [cancellingSubscriptionId, setCancellingSubscriptionId] = useState(null);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [isRemoveOpen, setIsRemoveOpen] = useState(false);
    const [programToRemove, setProgramToRemove] = useState(null);
    const [isRemoving, setIsRemoving] = useState(false);

    React.useEffect(() => {
        const handleCalendlyMessage = async (e) => {
            if (e.data && e.data.event === "calendly.event_scheduled") {
                if (schedulingBookingId) {
                    try {
                        await fetch(`/api/bookings/${schedulingBookingId}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ status: "confirmed" }),
                        });
                        toast.success("Consultation Scheduled!", {
                            description: "Your session has been successfully booked and confirmed.",
                        });
                        setIsSchedulingOpen(false);
                        setSchedulingBookingId(null);
                        router.refresh();
                    } catch (err) {
                        console.error("Error updating booking status:", err);
                        toast.error("Failed to update booking status");
                    }
                }
            }
        };

        if (isSchedulingOpen) {
            window.addEventListener("message", handleCalendlyMessage);
        }
        return () => {
            window.removeEventListener("message", handleCalendlyMessage);
        };
    }, [schedulingBookingId, isSchedulingOpen, router]);

    const openReviewModal = (program) => {
        setSelectedProgram(program);
        const existingReview = reviews.find(r => r.program_id === program.id);
        if (existingReview) {
            setRating(existingReview.rating);
            setReviewText(existingReview.review_text || '');
        } else {
            setRating(5);
            setReviewText('');
        }
        setIsReviewOpen(true);
    };

    // Item 5: Reset review modal state in closeReviewModal callback
    const closeReviewModal = () => {
        setIsReviewOpen(false);
        setSelectedProgram(null);
        setRating(5);
        setReviewText('');
    };

    const openCancelModal = (subscriptionCode) => {
        setCancellingSubscriptionId(subscriptionCode);
        setIsCancelOpen(true);
    };

    const cancelSubscription = async () => {
        if (!cancellingSubscriptionId) return;
        setIsCancelling(true);
        try {
            const res = await fetch('/api/subscriptions/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscription_id: cancellingSubscriptionId })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to cancel subscription');
            toast.success("Subscription cancelled. You'll keep access until the end of your current billing period.");
            setIsCancelOpen(false);
            router.refresh();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsCancelling(false);
        }
    };

    const isProgramOwned = (programId) => {
        const isDirectlyPurchased = purchasedPrograms?.some((p) => p.id === programId);
        const hasActiveSub = subscriptions?.some(
            (sub) => sub.program_id === programId && (sub.status === 'active' || sub.status === 'non-renewing')
        );
        return isDirectlyPurchased || hasActiveSub;
    };

    // Helper: find a subscription for a given program
    const getSubscriptionForProgram = (program) => {
        if (!program) return null;
        return subscriptions.find(s =>
            (s.program_id === program.id || (program.paystack_plan_code && s.plan_code === program.paystack_plan_code)) &&
            (s.status === 'active' || s.status === 'non-renewing' || s.status === 'past_due')
        ) || null;
    };

    const openRemoveModal = (program) => {
        setProgramToRemove(program);
        setIsRemoveOpen(true);
    };

    const closeRemoveModal = () => {
        setIsRemoveOpen(false);
        setProgramToRemove(null);
    };

    const removeProgram = async () => {
        if (!programToRemove) return;
        setIsRemoving(true);
        try {
            // Check for active subscription
            const sub = getSubscriptionForProgram(programToRemove);
            if (sub && sub.status === 'active') {
                // Cancel subscription first
                const subRes = await fetch('/api/subscriptions/cancel', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ subscription_id: sub.paystack_subscription_code || sub.id })
                });
                if (!subRes.ok) {
                    const data = await subRes.json();
                    throw new Error(data.error || 'Failed to cancel subscription');
                }
            }

            // Remove program access
            const res = await fetch('/api/programs/remove', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ program_id: programToRemove.id })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to remove program');

            toast.success("Program removed successfully.");
            closeRemoveModal();
            router.refresh();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsRemoving(false);
        }
    };

    const submitReview = async () => {
        if (rating === 0) {
            toast.error("Please select a rating.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    program_id: selectedProgram.id,
                    rating,
                    review_text: reviewText
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to submit review');

            toast.success("Review submitted successfully!");
            closeReviewModal();
            router.refresh();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">My Profile</h1>
                        <p className="text-slate-500">Welcome back, {profile?.full_name || 'User'}</p>
                    </div>
                </div>

                {/* Item 7: Error State for Failed Fetches */}
                {fetchError && (
                    <Card className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center text-red-700 space-y-4">
                        <AlertTriangle className="w-10 h-10 mx-auto text-red-500" />
                        <div>
                            <h3 className="font-bold text-lg">Unable to load profile data</h3>
                            <p className="text-sm mt-1 text-red-600">{fetchError}</p>
                        </div>
                        <Button onClick={() => router.refresh()} variant="outline" className="rounded-full border-red-300 text-red-700 hover:bg-red-100 mx-auto">
                            <RefreshCcw className="w-4 h-4 mr-2" /> Retry
                        </Button>
                    </Card>
                )}

                {/* Purchased Programs */}
                <div>
                    <h2 className="text-2xl font-bold mb-6">My Programs</h2>

                    {/* Item 8: Empty state when purchasedPrograms is empty */}
                    {purchasedPrograms.length === 0 ? (
                        <Card className="bg-white border-dashed border-2 border-slate-200 shadow-none rounded-3xl p-12 text-center space-y-4">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                                <BookOpen size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">No programs yet</h3>
                            <p className="text-slate-500 text-sm max-w-sm mx-auto">
                                You haven&apos;t enrolled in any fitness or nutrition programs yet.
                            </p>
                            <Link href="/">
                                <Button className="mt-2 rounded-full bg-black text-white px-8 py-3 font-medium hover:bg-zinc-800 transition-colors">
                                    Browse programs &rarr;
                                </Button>
                            </Link>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {purchasedPrograms.map(program => {
                                const hasReviewed = reviews.some(r => r.program_id === program.id);

                                return (
                                    <Card key={program.id || program.access_id} className="bg-white border-none rounded-3xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow relative">
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-red-50 hover:text-red-600 border border-slate-100 transition-colors"
                                            onClick={() => openRemoveModal(program)}
                                            title="Remove Program"
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                        {/* Item 6: Use Next.js Image instead of <img> */}
                                        {program.image_url ? (
                                            <div className="w-full h-48 bg-slate-100 relative">
                                                <Image
                                                    src={program.image_url}
                                                    alt={program.title || 'Program image'}
                                                    width={400}
                                                    height={200}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full h-48 bg-slate-200 flex items-center justify-center text-slate-400 font-bold text-center p-4">
                                                {program.title}
                                            </div>
                                        )}
                                        <CardContent className="p-6 flex flex-col flex-1">
                                            <h3 className="font-bold text-lg mb-2">{program.title}</h3>
                                            <p className="text-slate-500 text-sm line-clamp-2 mb-6 flex-1">
                                                {program.description}
                                            </p>

                                            <div className="flex flex-col gap-2 mt-auto">
                                                {program.status === 'active' ? (
                                                    program.review_status === 'pending' ? (
                                                        <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 text-center mb-2">
                                                            <p className="text-xs font-semibold text-orange-600">Review Pending</p>
                                                            <p className="text-[10px] text-orange-500 mt-1">Admin is reviewing your application.</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {program.has_dashboard_access && (
                                                                <Link href={`/profile/programs/${program.id}`}>
                                                                    <Button className="w-full rounded-full bg-black text-white hover:bg-slate-800 transition-colors">
                                                                        Access Program
                                                                    </Button>
                                                                </Link>
                                                            )}

                                                            {/* Render signed URL digital download links */}
                                                            {program.has_digital_downloads && program.assets && program.assets.length > 0 && (
                                                                <div className="space-y-1.5 my-1">
                                                                    <p className="text-xs font-semibold text-slate-700">Digital Downloads:</p>
                                                                    {program.assets.map((asset, idx) => (
                                                                        <a
                                                                            key={idx}
                                                                            href={asset.signed_url || asset.file_url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs hover:bg-slate-100 transition-colors text-slate-800 font-medium"
                                                                        >
                                                                            <span className="truncate mr-2">{asset.file_name}</span>
                                                                            <Download size={14} className="text-slate-500 flex-shrink-0" />
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {/* Render dynamic button based on booking state if it's a consultation */}
                                                            {(program.has_online_one_on_one || program.has_online_group || program.has_online_consultations) && program.booking_url && (
                                                                (() => {
                                                                    // Find latest booking for this program
                                                                    const latestBooking = userBookings?.filter(b => b.program_id === program.id && b.status !== 'cancelled')
                                                                        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

                                                                    if (latestBooking) {
                                                                        const status = latestBooking.status;
                                                                        const unlocked = latestBooking.unlocked_purchase;

                                                                        if (status === 'completed' && unlocked && !isProgramOwned(program.id)) {
                                                                            return (
                                                                                <Link href={`/programs/${program.id}/onboarding`} className="w-full">
                                                                                    <Button className="w-full rounded-full bg-black text-white hover:bg-zinc-800">
                                                                                        Purchase Program
                                                                                    </Button>
                                                                                </Link>
                                                                            );
                                                                        } else if (status === 'needs_followup') {
                                                                            return (
                                                                                <Button
                                                                                    className="w-full rounded-full bg-blue-600 text-white hover:bg-blue-700"
                                                                                    onClick={() => setBookingModalState({ isOpen: true, program, mode: 'followup', parentBookingId: latestBooking.id, consultationRound: (latestBooking.consultation_round || 1) + 1 })}
                                                                                >
                                                                                    Book Follow-Up
                                                                                </Button>
                                                                            );
                                                                        } else if (status === 'completed' && !unlocked) {
                                                                            return (
                                                                                <Button variant="outline" className="w-full rounded-full" disabled>
                                                                                    ⏳ Awaiting Purchase
                                                                                </Button>
                                                                            );
                                                                        } else if (['pending', 'confirmed'].includes(status)) {
                                                                            return (
                                                                                <Button variant="outline" className="w-full rounded-full" disabled>
                                                                                    ⏳ Awaiting Follow Up
                                                                                </Button>
                                                                            );
                                                                        }
                                                                    }

                                                                    // Default fallback if no booking exists or logic didn't match
                                                                    return (
                                                                        <Button variant="outline" className="w-full rounded-full" onClick={() => window.open(program.booking_url, '_blank')}>
                                                                            Book Consultation
                                                                        </Button>
                                                                    );
                                                                })()
                                                            )}
                                                            {program.has_physical_sessions && program.location_details && (
                                                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">
                                                                    <p className="text-xs font-semibold text-slate-700 mb-1">Physical Location:</p>
                                                                    <p className="text-xs text-slate-600">{program.location_details}</p>
                                                                </div>
                                                            )}
                                                        </>
                                                    )
                                                ) : (
                                                    (() => {
                                                        const sub = getSubscriptionForProgram(program);
                                                        const renewUrl = program.paystack_plan_code
                                                            ? `https://paystack.com/pay/${program.paystack_plan_code}`
                                                            : null;

                                                        if (sub?.status === 'past_due') {
                                                            return (
                                                                <div className="bg-red-50 p-3 rounded-xl border border-red-100 text-center mb-2 space-y-2">
                                                                    <p className="text-xs font-semibold text-red-600">Payment Failed — Access Suspended</p>
                                                                    {renewUrl && (
                                                                        <a
                                                                            href={`${renewUrl}?email=${encodeURIComponent(user?.email || '')}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="flex items-center justify-center w-full py-1.5 px-4 rounded-full bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors"
                                                                        >
                                                                            🔄 Renew to Restore Access
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            <div className="bg-red-50 p-3 rounded-xl border border-red-100 text-center mb-2">
                                                                <p className="text-xs font-semibold text-red-600">Subscription Cancelled / Expired</p>
                                                            </div>
                                                        );
                                                    })()
                                                )}

                                                {/* Subscription Management & Next Payment Countdown */}
                                                {(() => {
                                                    const sub = getSubscriptionForProgram(program);
                                                    if (!sub) return null;

                                                    const billingDate = sub.current_period_end || sub.next_billing_date;
                                                    const nextPaymentText = billingDate ? `Next Billing Date: ${new Date(billingDate).toLocaleDateString()}` : null;

                                                    // Build Paystack-hosted renewal link for this subscription's plan
                                                    const renewUrl = program.paystack_plan_code
                                                        ? `https://paystack.com/pay/${program.paystack_plan_code}`
                                                        : null;

                                                    if (sub.status === 'past_due') {
                                                        return (
                                                            <div className="space-y-2 mt-1">
                                                                <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
                                                                    <p className="text-xs font-semibold text-red-700">Payment Failed</p>
                                                                    <p className="text-[10px] text-red-600 mt-0.5">
                                                                        Your last payment could not be processed. Renew to restore access.
                                                                    </p>
                                                                </div>
                                                                {renewUrl ? (
                                                                    <a
                                                                        href={`${renewUrl}?email=${encodeURIComponent(user?.email || '')}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center justify-center w-full py-2 px-4 rounded-full bg-black text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
                                                                    >
                                                                        🔄 Renew Subscription
                                                                    </a>
                                                                ) : (
                                                                    <Button
                                                                        variant="outline"
                                                                        className="w-full rounded-full text-xs border-red-200 text-red-700"
                                                                        onClick={() => router.push('/')}
                                                                    >
                                                                        🔄 Re-subscribe
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        );
                                                    }

                                                    if (sub.status === 'non-renewing') {
                                                        return (
                                                            <div className="space-y-2 mt-1">
                                                                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                                                                    <p className="text-xs font-semibold text-amber-700">Cancellation Scheduled</p>
                                                                    <p className="text-[10px] text-amber-600 mt-0.5">
                                                                        Access continues until {billingDate ? new Date(billingDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'end of billing period'}.
                                                                    </p>
                                                                </div>
                                                                {renewUrl && (
                                                                    <a
                                                                        href={`${renewUrl}?email=${encodeURIComponent(user?.email || '')}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center justify-center w-full py-2 px-4 rounded-full bg-black text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
                                                                    >
                                                                        🔄 Renew Subscription
                                                                    </a>
                                                                )}
                                                            </div>
                                                        );
                                                    }

                                                    if (sub.status === 'active') {
                                                        return (
                                                            <div className="space-y-2 mt-1">
                                                                {nextPaymentText && (
                                                                    <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-2.5 flex items-center justify-center gap-2 text-center">
                                                                        <Clock size={14} className="text-blue-600 flex-shrink-0" />
                                                                        <span className="text-xs font-medium text-blue-700">{nextPaymentText}</span>
                                                                    </div>
                                                                )}
                                                                <Button
                                                                    variant="ghost"
                                                                    className="w-full rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 text-xs"
                                                                    onClick={() => openCancelModal(sub.paystack_subscription_code || sub.id)}
                                                                >
                                                                    Cancel Subscription
                                                                </Button>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                })()}

                                                <Button
                                                    variant="ghost"
                                                    className="w-full rounded-full mt-2"
                                                    onClick={() => openReviewModal(program)}
                                                >
                                                    {hasReviewed ? 'Edit Review' : 'Leave a Review'}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Consultation Bookings Section */}
                {userBookings && userBookings.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">My Consultation Bookings</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {userBookings.map(b => (
                                <Card key={b.id} className="bg-white border-none rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-lg">{b.programs?.title || "Consultation Call"}</h3>
                                                <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded">
                                                    {(b.consultation_round || 1) > 1 ? 'Follow-Up Session' : 'Initial Consultation'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 font-mono mt-0.5">Ref: {b.consultation_payment_ref || b.id.slice(0, 8)}</p>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${b.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                b.status === 'confirmed' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                    b.status === 'needs_followup' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                                        b.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                                                            'bg-amber-50 text-amber-700 border-amber-100'
                                            }`}>
                                            {b.status.toUpperCase().replace('_', ' ')}
                                        </span>
                                    </div>

                                    {b.status === 'needs_followup' && (
                                        <p className="text-xs text-indigo-700 bg-indigo-50 p-3 rounded-2xl">
                                            Trainer recommended a follow-up call to finalize your plan.
                                        </p>
                                    )}
                                    {b.notes && (
                                        <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl italic">
                                            "{b.notes}"
                                        </p>
                                    )}

                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                        <div className="text-xs text-slate-500">
                                            <span>Fee Paid: </span>
                                            <span className="font-bold text-slate-900">Kshs {(b.programs?.consultation_fee || 0).toLocaleString()}</span>
                                        </div>

                                        {isProgramOwned(b.program_id) ? (
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                                    Enrolled in Program
                                                </span>

                                                <Button className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700 text-xs px-4 py-1.5 font-semibold shadow-md">
                                                    Owned program &rarr;
                                                </Button>

                                            </div>
                                        ) : b.status === 'needs_followup' ? (
                                            <Button
                                                className="rounded-full bg-blue-600 text-white hover:bg-blue-700 text-xs px-5 py-2 font-semibold shadow-md"
                                                onClick={() => setBookingModalState({ isOpen: true, program: b.programs, mode: 'followup', parentBookingId: b.id, consultationRound: (b.consultation_round || 1) + 1 })}
                                            >
                                                Book Follow-Up (Kshs {b.programs?.followup_fee || 'Discounted'}) &rarr;
                                            </Button>
                                        ) : b.unlocked_purchase && b.program_id ? (
                                            <Link href={`/programs/${b.program_id}/onboarding`}>
                                                <Button className="rounded-full bg-black text-white hover:bg-zinc-800 text-xs px-5 py-2 font-semibold shadow-md">
                                                    Buy Full Program &rarr;
                                                </Button>
                                            </Link>
                                        ) : b.status === 'pending' ? (
                                            <Button
                                                className="rounded-full bg-orange-500 hover:bg-orange-600 text-white text-xs px-5 py-2 font-semibold shadow-md flex items-center gap-2"
                                                onClick={() => {
                                                    setSchedulingBookingId(b.id);
                                                    setIsSchedulingOpen(true);
                                                }}
                                            >
                                                <Calendar className="w-4 h-4" />
                                                Schedule Call
                                            </Button>
                                        ) : (
                                            <span className="text-[11px] text-slate-400 font-medium">
                                                {b.status === 'completed' ? 'Purchase Unlocked' : 'Awaiting Consultation Call'}
                                            </span>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Review Modal */}
            <Dialog open={isReviewOpen} onOpenChange={(open) => { if (!open) closeReviewModal(); }}>
                <DialogContent className="sm:max-w-[425px] rounded-3xl p-6 bg-white">
                    <DialogHeader>
                        <DialogTitle>Review {selectedProgram?.title}</DialogTitle>
                        <DialogDescription>
                            Share your experience with this program to help others.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-6 flex flex-col gap-6">
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                    key={star}
                                    className={`w-8 h-8 cursor-pointer transition-colors ${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200 hover:text-yellow-200'}`}
                                    onClick={() => setRating(star)}
                                />
                            ))}
                        </div>
                        <textarea
                            className="w-full min-h-[120px] p-4 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 resize-none"
                            placeholder="Write your review here (optional)..."
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" className="rounded-full" onClick={closeReviewModal}>
                            Cancel
                        </Button>
                        <Button className="rounded-full bg-black text-white" onClick={submitReview} disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Cancel Subscription Confirmation Modal */}
            <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
                <DialogContent className="sm:max-w-[420px] rounded-3xl p-6 bg-white">
                    <DialogHeader>
                        <div className="flex justify-center mb-4">
                            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                                <AlertTriangle className="w-7 h-7 text-red-500" />
                            </div>
                        </div>
                        <DialogTitle className="text-center">Cancel Subscription?</DialogTitle>
                        <DialogDescription className="text-center mt-2">
                            You will keep full access to your program until the end of your current billing period.
                            After that, your subscription will not renew and access will be removed.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mt-2 text-sm text-amber-800">
                        <p className="font-semibold mb-1">What happens next:</p>
                        <ul className="space-y-1 text-xs list-disc list-inside">
                            <li>Your access continues until the billing period ends.</li>
                            <li>No further payments will be charged.</li>
                            <li>You can re-subscribe at any time from the programs page.</li>
                        </ul>
                    </div>

                    <div className="flex gap-3 mt-4">
                        <Button
                            variant="outline"
                            className="flex-1 rounded-full"
                            onClick={() => setIsCancelOpen(false)}
                            disabled={isCancelling}
                        >
                            Keep Subscription
                        </Button>
                        <Button
                            className="flex-1 rounded-full bg-red-600 hover:bg-red-700 text-white"
                            onClick={cancelSubscription}
                            disabled={isCancelling}
                        >
                            {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Remove Program Confirmation Modal */}
            <Dialog open={isRemoveOpen} onOpenChange={(open) => { if (!open) closeRemoveModal(); }}>
                <DialogContent className="sm:max-w-[420px] rounded-3xl p-6 bg-white">
                    <DialogHeader>
                        <div className="flex justify-center mb-4">
                            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                                <Trash2 className="w-7 h-7 text-red-500" />
                            </div>
                        </div>
                        <DialogTitle className="text-center">Remove Program?</DialogTitle>
                        <DialogDescription className="text-center mt-2">
                            Are you sure you want to permanently remove <strong>{programToRemove?.title}</strong> from your dashboard?
                        </DialogDescription>
                    </DialogHeader>

                    {programToRemove && getSubscriptionForProgram(programToRemove)?.status === 'active' && (
                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mt-2 text-sm text-amber-800">
                            <p className="font-semibold mb-1 flex items-center gap-1"><AlertTriangle size={14} /> Active Subscription</p>
                            <p className="text-xs">
                                Proceeding will <strong>cancel your subscription immediately</strong> and remove your access. You will not be charged again.
                            </p>
                        </div>
                    )}

                    <div className="flex gap-3 mt-4">
                        <Button
                            variant="outline"
                            className="flex-1 rounded-full"
                            onClick={closeRemoveModal}
                            disabled={isRemoving}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 rounded-full bg-red-600 hover:bg-red-700 text-white"
                            onClick={removeProgram}
                            disabled={isRemoving}
                        >
                            {isRemoving ? 'Removing...' : 'Yes, Remove'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Inline Scheduling Modal for Pending Bookings */}
            <Dialog open={isSchedulingOpen} onOpenChange={(open) => {
                if (!open) {
                    setIsSchedulingOpen(false);
                    setSchedulingBookingId(null);
                }
            }}>
                <DialogContent className="sm:max-w-3xl w-full h-[85vh] max-h-[750px] flex flex-col rounded-3xl p-6 bg-white">
                    <DialogHeader className="space-y-1 pb-2 border-b border-slate-100">
                        <DialogTitle className="text-xl font-bold text-slate-900">
                            Schedule Your Consultation
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 text-xs">
                            Pick a slot below to complete your booking. The schedule is synced instantly.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 w-full mt-4 rounded-xl overflow-hidden border border-slate-100 min-h-[400px] relative bg-slate-50">
                        <iframe
                            src={`${process.env.NEXT_PUBLIC_CALENDLY_URL || "https://calendly.com/wambialvin/program-set-up-meeting"}?name=${encodeURIComponent(profile?.full_name || '')}&email=${encodeURIComponent(profile?.email || '')}&hide_gdpr_banner=1&embed_domain=${encodeURIComponent(typeof window !== "undefined" ? window.location.origin : "")}`}
                            width="100%"
                            height="100%"
                            style={{ border: "0" }}
                            className="w-full h-full"
                        />
                    </div>
                </DialogContent>
            </Dialog>

            <BookingModal
                isOpen={bookingModalState.isOpen}
                onClose={() => {
                    setBookingModalState({ isOpen: false, program: null, mode: 'initial', parentBookingId: null, consultationRound: 1 });
                    router.refresh();
                }}
                program={bookingModalState.program}
                userProfile={profile}
                mode={bookingModalState.mode}
                parentBookingId={bookingModalState.parentBookingId}
                consultationRound={bookingModalState.consultationRound}
            />
        </div>
    );
}
