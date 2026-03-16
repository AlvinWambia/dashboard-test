
import {
    Plus, Import, Eye, ReceiptText,
    CircleDollarSign
} from 'lucide-react';
import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserChart } from "@/components/admin/userChart";
import { ProfileForm } from "@/components/admin/profileForm";
import { AdminHeader } from "@/components/admin/AdminHeader";
import React from 'react';

const notifications = [
    {
        id: 1,
        title: "New Order Created",
        target: "Order #284",
        time: "8 minutes ago",
        icon: <ReceiptText className="h-5 w-5 text-green-600" />,
        bgColor: "bg-green-100",
        unread: false,
    },
    {
        id: 2,
        title: "Payment Completed",
        target: "Order #255",
        time: "12 minutes ago",
        icon: <CircleDollarSign className="h-5 w-5 text-blue-600" />,
        bgColor: "bg-blue-50", // Highlighted unread background
        unread: true,
    },
]





export default async function DashboardPage() {
    const supabase = await createClient();

    // Inside your async DashboardPage()
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: users } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('role', 'user')
        .gte('created_at', sevenDaysAgo.toISOString());

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



    return (
        <div className="p-4 md:p-8 bg-white min-h-screen">
            <AdminHeader title="Profile" profile={profile} user={user} />

            {/* Hero Section */}
            <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Profile</h1>
                        <p className="text-gray-500 text-sm">Update your administrative profile and view notifications.</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Profile Form (Large item) */}
                    <div className="lg:col-span-1">
                        <ProfileForm profile={profile} user={user} />
                    </div>

                    {/* Registrations Chart (Wide) */}
                    <Card className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <CardHeader className="flex flex-row justify-between items-center p-6 pb-0">
                            <CardTitle className="text-lg">User Registrations</CardTitle>
                            <Button variant="outline" size="sm" className="rounded-xl h-9">
                                <Eye className="h-4 w-4 mr-2" /> View Users
                            </Button>
                        </CardHeader>
                        <CardContent className="p-6">
                            <UserChart chartData={counts} />
                        </CardContent>
                    </Card>

                    {/* Side Cards Stacking */}
                    <div className="flex flex-col gap-6">
                        {/* Notifications */}
                        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm grow overflow-hidden">
                            <CardHeader className="p-6 pb-4">
                                <CardTitle className="text-lg">Recent Alerts</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 pt-0 space-y-4">
                                {notifications.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`flex items-center gap-3 p-3 rounded-2xl transition-colors cursor-pointer hover:bg-gray-50 ${item.unread ? 'bg-blue-50/50' : ''}`}
                                    >
                                        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${item.bgColor}`}>
                                            {React.cloneElement(item.icon, { size: 18 })}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-bold text-slate-900 truncate">
                                                {item.title}
                                            </p>
                                            <p className="text-[10px] text-slate-500 truncate">{item.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Settings placeholder */}
                        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 overflow-hidden">
                            <CardTitle className="text-lg mb-2">Settings</CardTitle>
                            <p className="text-xs text-gray-400">Manage your system preferences and security levels here.</p>
                            <Button variant="link" className="p-0 text-xs text-black font-bold h-auto mt-4">Go to Settings →</Button>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}