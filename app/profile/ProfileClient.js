"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Star, AlertTriangle, ArrowLeft, RefreshCcw, BookOpen, Download, Clock } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfileClient({ profile, user, purchasedPrograms = [], reviews = [], subscriptions = [], userBookings = [], fetchError = null }) {
    const router = useRouter();
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isCancelOpen, setIsCancelOpen] = useState(false);
    const [cancellingSubscriptionId, setCancellingSubscriptionId] = useState(null);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

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

    // Helper: find a subscription for a given plan_code (matched via program)
    const getSubscriptionForProgram = (program) => {
        if (!program || !program.paystack_plan_code) return null;
        return subscriptions.find(s => 
            s.plan_code === program.paystack_plan_code && 
            (s.status === 'active' || s.status === 'non-renewing')
        ) || null;
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
                                    <Card key={program.id || program.access_id} className="bg-white border-none rounded-3xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow">
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

                                                            {program.has_online_consultations && program.booking_url && (
                                                                <Button variant="outline" className="w-full rounded-full" onClick={() => window.open(program.booking_url, '_blank')}>
                                                                    Book Consultation
                                                                </Button>
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
                                                    <div className="bg-red-50 p-3 rounded-xl border border-red-100 text-center mb-2">
                                                        <p className="text-xs font-semibold text-red-600">Subscription Cancelled / Expired</p>
                                                    </div>
                                                )}

                                                {/* Subscription Management & Next Payment Countdown */}
                                                {(() => {
                                                    const sub = getSubscriptionForProgram(program);
                                                    if (!sub) return null;

                                                    // Calculate days until next payment
                                                    let nextPaymentText = null;
                                                    if (sub.next_billing_date) {
                                                        const nextDate = new Date(sub.next_billing_date);
                                                        const today = new Date();
                                                        const diffTime = nextDate.getTime() - today.getTime();
                                                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                        
                                                        if (diffDays > 1) {
                                                            nextPaymentText = `Next payment in ${diffDays} days (${nextDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })})`;
                                                        } else if (diffDays === 1) {
                                                            nextPaymentText = `Next payment due tomorrow (${nextDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })})`;
                                                        } else if (diffDays === 0) {
                                                            nextPaymentText = `Next payment due today!`;
                                                        } else {
                                                            nextPaymentText = `Payment due (${nextDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })})`;
                                                        }
                                                    }

                                                    if (sub.status === 'non-renewing') {
                                                        return (
                                                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center mt-1">
                                                                <p className="text-xs font-semibold text-amber-700">Cancellation Scheduled</p>
                                                                <p className="text-[10px] text-amber-600 mt-0.5">
                                                                    Access continues until {sub.next_billing_date ? new Date(sub.next_billing_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'end of billing period'}.
                                                                </p>
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
                                            <h3 className="font-bold text-lg">{b.programs?.title || "Consultation Call"}</h3>
                                            <p className="text-xs text-slate-500 font-mono mt-0.5">Ref: {b.consultation_payment_ref || b.id.slice(0, 8)}</p>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                                            b.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            b.status === 'confirmed' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                            b.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                                            'bg-amber-50 text-amber-700 border-amber-100'
                                        }`}>
                                            {b.status.toUpperCase()}
                                        </span>
                                    </div>

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

                                        {b.unlocked_purchase && b.program_id ? (
                                            <Link href={`/programs/${b.program_id}/onboarding`}>
                                                <Button className="rounded-full bg-black text-white hover:bg-zinc-800 text-xs px-5 py-2 font-semibold shadow-md">
                                                    Buy Full Program &rarr;
                                                </Button>
                                            </Link>
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
        </div>
    );
}
