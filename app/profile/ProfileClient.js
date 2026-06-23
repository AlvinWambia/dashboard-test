"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ProfileClient({ profile, user, purchasedPrograms, reviews }) {
    const router = useRouter();
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const openReviewModal = (program) => {
        setSelectedProgram(program);
        const existingReview = reviews.find(r => r.program_id === program.id);
        if (existingReview) {
            setRating(existingReview.rating);
            setReviewText(existingReview.review_text || '');
        } else {
            setRating(0);
            setReviewText('');
        }
        setIsReviewOpen(true);
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
            setIsReviewOpen(false);
            router.refresh(); // Refresh the server component to get updated reviews
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

                {/* Purchased Programs */}
                <div>
                    <h2 className="text-2xl font-bold mb-6">My Programs</h2>
                    {purchasedPrograms.length === 0 ? (
                        <Card className="bg-white border-dashed shadow-none rounded-3xl p-12 text-center">
                            <p className="text-slate-500">You haven't purchased any programs yet.</p>
                            <Link href="/#programs">
                                <Button className="mt-4 rounded-full bg-black text-white px-8">Explore Programs</Button>
                            </Link>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {purchasedPrograms.map(program => {
                                const hasReviewed = reviews.some(r => r.program_id === program.id);

                                return (
                                    <Card key={program.id} className="bg-white border-none rounded-3xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow">
                                        {program.image_url ? (
                                            <div className="w-full h-48 bg-slate-100">
                                                <img
                                                    src={program.image_url}
                                                    alt={program.title}
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
                                                                        Access Dashboard
                                                                    </Button>
                                                                </Link>
                                                            )}
                                                            {program.has_digital_downloads && (
                                                                <Link href={`/profile/programs/${program.id}/downloads`}>
                                                                    <Button variant="outline" className="w-full rounded-full">
                                                                        Digital Downloads
                                                                    </Button>
                                                                </Link>
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
            </div>

            {/* Review Modal */}
            <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
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
                        <Button variant="ghost" className="rounded-full" onClick={() => setIsReviewOpen(false)}>
                            Cancel
                        </Button>
                        <Button className="rounded-full bg-black text-white" onClick={submitReview} disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
