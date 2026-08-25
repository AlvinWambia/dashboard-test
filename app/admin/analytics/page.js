import { createClient } from "@/supabase/server";
import { createAdminClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import Dashboard from "@/components/admin/analytics";
import { AdminHeader } from "@/components/admin/AdminHeader";
import React from 'react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function DashboardPage() {
    const supabase = await createClient();

    // 1. Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'admin') redirect("/home?error=unauthorized");

    // Use admin client so RLS doesn't filter out other users' rows
    const adminSupabase = createAdminClient();

    // User signup trend (count per day-of-week)
    const { data: users } = await adminSupabase
        .from('profiles')
        .select('created_at')
        .eq('role', 'user');

    const counts = new Array(7).fill(0);
    users?.forEach((u) => {
        const day = new Date(u.created_at).getDay();
        counts[day] += 1;
    });

    // --- Date range helpers ---
    const today = new Date();

    const currentPeriodStart = new Date();
    currentPeriodStart.setDate(today.getDate() - 30);

    const previousPeriodStart = new Date();
    previousPeriodStart.setDate(today.getDate() - 60);
    const previousPeriodEnd = new Date(currentPeriodStart);

    // --- Parallel fetches for both periods ---
    // Revenue sources:
    //   payment_history  → subscription recurring payments (written by Paystack webhook)
    //   orders           → one-time program purchases (status='paid')
    //   bookings         → initial consultation payments (consultation_paid=true, consultation_round=1 or null)
    //   bookings         → follow-up consultation payments (consultation_paid=true, consultation_round>1)
    const [
        { data: currentPayHist },
        { data: currentOrders },
        { data: currentInitialBookings },
        { data: currentFollowupBookings },
        { data: previousPayHist },
        { data: previousOrders },
        { data: previousInitialBookings },
        { data: previousFollowupBookings },
    ] = await Promise.all([
        // Current period — payment_history (subscription renewals)
        adminSupabase
            .from('payment_history')
            .select('amount, created_at')
            .eq('status', 'success')
            .gte('created_at', currentPeriodStart.toISOString()),

        // Current period — one-time program purchases
        adminSupabase
            .from('orders')
            .select('program_name, price, created_at')
            .eq('status', 'paid')
            .gte('created_at', currentPeriodStart.toISOString()),

        // Current period — initial consultation bookings (round 1 or unset)
        adminSupabase
            .from('bookings')
            .select('created_at, consultation_round, programs ( consultation_fee, followup_fee, title )')
            .eq('consultation_paid', true)
            .or('consultation_round.eq.1,consultation_round.is.null')
            .gte('created_at', currentPeriodStart.toISOString()),

        // Current period — follow-up consultation bookings (round > 1)
        adminSupabase
            .from('bookings')
            .select('created_at, consultation_round, programs ( consultation_fee, followup_fee, title )')
            .eq('consultation_paid', true)
            .gt('consultation_round', 1)
            .gte('created_at', currentPeriodStart.toISOString()),

        // Previous period — payment_history
        adminSupabase
            .from('payment_history')
            .select('amount')
            .eq('status', 'success')
            .gte('created_at', previousPeriodStart.toISOString())
            .lt('created_at', previousPeriodEnd.toISOString()),

        // Previous period — one-time program purchases
        adminSupabase
            .from('orders')
            .select('id, price')
            .eq('status', 'paid')
            .gte('created_at', previousPeriodStart.toISOString())
            .lt('created_at', previousPeriodEnd.toISOString()),

        // Previous period — initial consultation bookings
        adminSupabase
            .from('bookings')
            .select('programs ( consultation_fee )')
            .eq('consultation_paid', true)
            .or('consultation_round.eq.1,consultation_round.is.null')
            .gte('created_at', previousPeriodStart.toISOString())
            .lt('created_at', previousPeriodEnd.toISOString()),

        // Previous period — follow-up consultation bookings
        adminSupabase
            .from('bookings')
            .select('programs ( followup_fee, consultation_fee )')
            .eq('consultation_paid', true)
            .gt('consultation_round', 1)
            .gte('created_at', previousPeriodStart.toISOString())
            .lt('created_at', previousPeriodEnd.toISOString()),
    ]);

    // --- Helpers: resolve the correct fee per booking type ---
    // Initial consultations use consultation_fee; follow-ups use followup_fee (falling back to consultation_fee)
    const getInitialFee = (b) => b.programs?.consultation_fee ?? 0;
    const getFollowupFee = (b) => b.programs?.followup_fee ?? b.programs?.consultation_fee ?? 0;

    // --- Build unified current-period payment list (amount + created_at) ---
    const currentPayments = [
        // Subscription renewals from payment_history
        ...(currentPayHist || []),
        // One-time program purchases from orders
        ...(currentOrders || []).map((o) => ({
            amount: o.price || 0,
            created_at: o.created_at,
        })),
        // Initial consultation bookings
        ...(currentInitialBookings || []).map((b) => ({
            amount: getInitialFee(b),
            created_at: b.created_at,
        })),
        // Follow-up consultation bookings (use followup_fee, not consultation_fee)
        ...(currentFollowupBookings || []).map((b) => ({
            amount: getFollowupFee(b),
            created_at: b.created_at,
        })),
    ];

    // --- Previous period total revenue ---
    const previousPaymentsAmount =
        (previousPayHist || []).reduce((acc, p) => acc + (p.amount || 0), 0) +
        (previousOrders || []).reduce((acc, o) => acc + (o.price || 0), 0) +
        (previousInitialBookings || []).reduce((acc, b) => acc + getInitialFee(b), 0) +
        (previousFollowupBookings || []).reduce((acc, b) => acc + getFollowupFee(b), 0);

    // --- Merge order counts (purchases + all consultations) ---
    const allCurrentBookings = [...(currentInitialBookings || []), ...(currentFollowupBookings || [])];
    const allPreviousBookings = [...(previousInitialBookings || []), ...(previousFollowupBookings || [])];

    const currentOrderCount = (currentOrders?.length || 0) + allCurrentBookings.length;
    const previousOrderCount = (previousOrders?.length || 0) + allPreviousBookings.length;

    // --- Current period stats ---
    const totalRevenue = currentPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const totalOrders = currentOrderCount;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const previousTotalRevenue = previousPaymentsAmount;
    const previousTotalOrders = previousOrderCount;
    const previousAvgOrderValue = previousTotalOrders > 0 ? previousTotalRevenue / previousTotalOrders : 0;

    // --- % changes ---
    const calculateChange = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    const revenueChange = calculateChange(totalRevenue, previousTotalRevenue);
    const ordersChange = calculateChange(totalOrders, previousTotalOrders);
    const avgOrderValueChange = calculateChange(avgOrderValue, previousAvgOrderValue);

    // --- Program Performance leaderboard ---
    const programStatsMap = {};

    // From one-time orders
    (currentOrders || []).forEach(order => {
        const name = order.program_name || 'Unknown';
        if (!programStatsMap[name]) programStatsMap[name] = { name, revenue: 0, count: 0 };
        programStatsMap[name].revenue += (order.price || 0);
        programStatsMap[name].count += 1;
    });

    // From initial consultation bookings
    (currentInitialBookings || []).forEach(booking => {
        const name = booking.programs?.title || 'Consultation';
        if (!programStatsMap[name]) programStatsMap[name] = { name, revenue: 0, count: 0 };
        programStatsMap[name].revenue += getInitialFee(booking);
        programStatsMap[name].count += 1;
    });

    // From follow-up consultation bookings
    (currentFollowupBookings || []).forEach(booking => {
        const name = booking.programs?.title || 'Consultation';
        if (!programStatsMap[name]) programStatsMap[name] = { name, revenue: 0, count: 0 };
        programStatsMap[name].revenue += getFollowupFee(booking);
        programStatsMap[name].count += 1;
    });

    const programStats = Object.values(programStatsMap).sort((a, b) => b.revenue - a.revenue);

    // --- Weekly Revenue Trend (last 7 days) — subscription + consultation ---
    const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        d.setHours(0, 0, 0, 0);
        return d;
    });

    const revenueTrend = last7Days.map(day => {
        const dayEnd = new Date(day);
        dayEnd.setHours(23, 59, 59, 999);

        const dayRevenue = currentPayments
            .filter(p => {
                const pDate = new Date(p.created_at);
                return pDate >= day && pDate <= dayEnd;
            })
            .reduce((acc, p) => acc + (p.amount || 0), 0);

        return {
            date: day.toLocaleDateString('en-US', { weekday: 'short' }),
            revenue: dayRevenue,
        };
    });

    const analyticsData = {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        revenueChange,
        ordersChange,
        avgOrderValueChange,
        programStats,
        revenueTrend,
    };

    return (
        <div className="p-4 md:p-8 bg-white min-h-screen">
            <AdminHeader title="Analytics" profile={profile} user={user} />

            {/* Dashboard Content */}
            <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100 mt-6">
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-gray-900">Analytics Overview</h1>
                    <p className="text-gray-400 text-sm mt-0.5">Here&apos;s what&apos;s happening in the last 30 days.</p>
                </div>
                <Dashboard data={analyticsData} />
            </div>
        </div>
    );

}