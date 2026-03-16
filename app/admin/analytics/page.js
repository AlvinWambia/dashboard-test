import { Plus, Import } from 'lucide-react';
import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Dashboard from "@/components/admin/analytics";
import { AdminHeader } from "@/components/admin/AdminHeader";
import React from 'react';





export default async function DashboardPage() {
    const supabase = await createClient();

    // Inside your async DashboardPage()
    const { data: users } = await supabase.from('profiles').select('created_at').eq('role', 'user');

    // Simple logic to count users per day of the week
    const counts = new Array(7).fill(0);
    users?.forEach((u) => {
        const day = new Date(u.created_at).getDay();
        counts[day] += 1;
    });

    // 1. Get the authenticated user from the session
    const { data: { user } } = await supabase.auth.getUser();

    // 2. If no user exists, send them to login
    if (!user) {
        redirect("/auth/login");
    }

    // 3. Fetch the role from the 'profiles' table (the source of truth)
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();


    console.log("Fetched Profile Data:", profile); // Check your terminal (not browser console)


    // 4. Redirect if they are NOT an admin
    if (!profile || profile.role !== 'admin') {
        redirect("/home?error=unauthorized");
    }

    // --- REAL ANALYTICS FETCHING ---
    
    // 1. Fetch Total Revenue & Total Orders
    const { data: payments } = await supabase
        .from('payments')
        .select('amount, created_at')
        .eq('status', 'success');
    
    const { data: orders } = await supabase
        .from('orders')
        .select('program_name, price, created_at')
        .eq('status', 'paid');

    const totalRevenue = payments?.reduce((acc, p) => acc + (p.amount || 0), 0) || 0;
    const totalOrders = orders?.length || 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // 2. Program Performance (Sales per Program)
    const programStatsMap = {};
    orders?.forEach(order => {
        const name = order.program_name || 'Unknown';
        if (!programStatsMap[name]) {
            programStatsMap[name] = { name, revenue: 0, count: 0 };
        }
        programStatsMap[name].revenue += (order.price || 0);
        programStatsMap[name].count += 1;
    });
    const programStats = Object.values(programStatsMap).sort((a, b) => b.revenue - a.revenue);

    // 3. Weekly Revenue Trend (Last 7 days)
    const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        d.setHours(0, 0, 0, 0);
        return d;
    });

    const revenueTrend = last7Days.map(day => {
        const dayEnd = new Date(day);
        dayEnd.setHours(23, 59, 59, 999);
        
        const dayRevenue = payments?.filter(p => {
            const pDate = new Date(p.created_at);
            return pDate >= day && pDate <= dayEnd;
        }).reduce((acc, p) => acc + (p.amount || 0), 0) || 0;

        return {
            date: day.toLocaleDateString('en-US', { weekday: 'short' }),
            revenue: dayRevenue
        };
    });

    const analyticsData = {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        programStats,
        revenueTrend
    };



    return (
        <div className="p-4 md:p-8 bg-white min-h-screen">
            <AdminHeader title="Analytics" profile={profile} user={user} />

            {/* Hero Section */}
            <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Analytics</h1>
                        <p className="text-gray-500 text-sm">Welcome back, Admin! Here is what's happening today.</p>
                    </div>
                    <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                        <Button className="bg-black text-white hover:bg-white hover:text-black hover:border hover:border-black rounded-xl h-10">
                            <Plus className="mr-2" size={18} /> Create Content
                        </Button>
                        <Button variant="outline" className="bg-white rounded-xl h-10">
                            <Import className="mr-2" size={18} /> Import Data
                        </Button>
                    </div>
                </div>

                {/* Grid Content */}
                <div className="">
                    <Dashboard data={analyticsData} />
                </div>

            </div>
        </div>
    );
}