import React from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default function HomeSkeleton() {
    return (
        <div className="min-h-screen bg-white p-6 lg:p-12 space-y-12 max-w-7xl mx-auto">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center mb-12">
                <Skeleton className="h-8 w-32 rounded-lg" />
                <div className="hidden md:flex gap-8">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-4 w-20" />)}
                </div>
                <Skeleton className="h-10 w-32 rounded-full" />
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Left Column */}
                <div className="col-span-12 lg:col-span-6 space-y-8">
                    <Skeleton className="h-20 w-full rounded-2xl" />
                    <Skeleton className="h-16 w-3/4 rounded-2xl" />
                    
                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="aspect-square rounded-[2rem]" />
                        ))}
                    </div>

                    <Skeleton className="h-[300px] w-full rounded-[3rem]" />
                </div>

                {/* Right Column */}
                <div className="col-span-12 lg:col-span-6">
                    <Skeleton className="h-full min-h-[650px] w-full rounded-[4rem]" />
                </div>
            </div>

            {/* Testimonials skeleton */}
            <div className="grid grid-cols-3 gap-6 pt-12">
                {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-48 rounded-[2rem]" />
                ))}
            </div>
        </div>
    )
}
