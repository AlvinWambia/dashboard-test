
import { Search, Bell, Mail, Plus, Import, Eye } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/supabase/server"; // Ensure this helper handles server-side cookies
import { redirect } from "next/navigation";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { SignOutButton } from "@/components/signOutButton";
import { UserChart } from "@/components/admin/userChart";
import { ProfileForm } from "@/components/admin/profileForm";





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



    return (
        <div className="p-8 bg-white">
            {/* Search and Profile Header */}
            <header className="flex justify-between items-center mb-8 bg-gray-100 px-5 py-5 rounded-2xl">
                <div className="relative w-96 ">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black " size={18} />
                    <Input className="pl-10 bg-white border-none shadow-sm text-sm rounded-2xl" placeholder="Search task" />
                </div>

                <div className="flex items-center gap-4">
                    <HoverCard>
                        <HoverCardTrigger asChild>
                            <Button variant="ghost" size="icon" className="bg-white rounded-full shadow-sm text-sm"><Mail size={20} /></Button>
                        </HoverCardTrigger>
                        <HoverCardContent>
                            <p>Messages</p>
                        </HoverCardContent>
                    </HoverCard>

                    <div className="flex items-center gap-4">
                        <SignOutButton />
                        {/* ... other profile details ... */}
                    </div>



                    <HoverCard>
                        <HoverCardTrigger asChild>
                            <Button variant="ghost" size="icon" className="bg-white rounded-full shadow-sm text-sm"><Bell size={20} /></Button>
                        </HoverCardTrigger>
                        <HoverCardContent>
                            <p>Notifications</p>
                        </HoverCardContent>
                    </HoverCard>

                    <div className="flex items-center gap-3 ">
                        <Avatar>
                            <AvatarImage
                                src={profile.avatar_url}
                                alt="@shadcn"
                                className=""
                            />
                            <AvatarFallback>{profile.full_name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col pl-5">
                            <p className="text-sm font-bold ">{profile.full_name}</p>
                            <p className="text-sm  ">{user.email}</p>

                        </div>
                    </div>

                </div>
            </header>

            {/* Hero Section */}
            <div className="bg-gray-100 rounded-xl p-5">
                <div className="flex justify-between items-end mb-8 ">
                    <div>
                        <h1 className="text-2xl font-bold">Profile</h1>
                        <p className="text-gray-500 text-sm">Welcome back, Admin! Here is what's happening today.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button className="bg-black text-white hover:bg-white hover:text-black hover:border hover:border-black">
                            <Plus className="mr-2" size={18} /> Create Content
                        </Button>
                        <Button variant="outline" className="bg-white">
                            <Import className="mr-2" size={18} /> Import Data
                        </Button>
                    </div>
                </div>

                {/* Grid Content */}
                <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-150">

                    {/* Large Feature Item */}
                    <ProfileForm profile={profile} user={user} />

                    {/* Wide Item */}
                    <Card className="md:col-span-2 bg-slate-50 bg-white">
                        <CardHeader className="flex justify-between items-center">
                            <CardTitle>User Registrations</CardTitle>
                            <Button variant="outline" size="sm">
                                <Eye /> View Users
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <UserChart chartData={counts} />
                        </CardContent>
                    </Card>

                    {/* Small Items */}
                    <Card className="bg-slate-50 bg-white">
                        <CardHeader>
                            <CardTitle>Notifications</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>Recents</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-50 bg-white">
                        <CardHeader>
                            <CardTitle>Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>Standard 1x1 block.</p>
                        </CardContent>
                    </Card>

                </div>

            </div>
        </div>
    );
}