

import { Search, Bell, Mail, Plus, Import, Eye, Users, Percent, TrendingUp, TrendingDown, LogOut, X, Link as LinkIcon, MoreVertical, AlertCircle, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage, AvatarBadge } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import Dashboard from "@/components/admin/analytics";
import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxItem,
    ComboboxList,
    ComboboxValue,
    useComboboxAnchor,
} from "@/components/ui/combobox"
const frameworks = [
    "Next.js",
    "SvelteKit",
    "Nuxt.js",
    "Remix",
    "Astro",
];

import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { SignOutButton } from "@/components/signOutButton";
import { UserChart } from "@/components/admin/userChart";
import { ProfileForm } from "@/components/admin/profileForm";
import React from 'react';
import MembersModal from "@/components/admin/userList.js";
import CommentsSection from "@/components/admin/commentsSection";




export default async function MembersPage() {
    const supabase = await createClient();

    // 1. Get the authenticated user from the session
    const { data: { user } } = await supabase.auth.getUser();

    // 2. If no user exists, send them to login
    if (!user) {
        redirect("/auth/login");
    }

    // Inside your async DashboardPage()
    const { data: users } = await supabase.from('profiles').select('created_at').eq('role', 'user');
    // Fetch all user profiles for the members modal. We query the `profiles` table
    // directly, as querying `auth.users` is restricted by database permissions for security.
    const { data: allProfilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, role, avatar_url');

    if (profilesError) {
        console.error('Error fetching user profiles:', profilesError);
    }

    // Fetch comments for the current user (admin notes)
    // We join with profiles to get author details
    const { data: comments, error: commentsError } = await supabase
        .from('user_comments')
        .select('*, author:profiles!author_id(full_name, avatar_url)')
        .eq('user_id', user.id) // Fetching comments where the target is the current admin
        .order('created_at', { ascending: false });

    if (commentsError) console.error("Error fetching comments:", commentsError);

    // The email is not available from the `profiles` table. We'll pass a placeholder.
    const allProfiles = allProfilesData?.map(profile => ({ ...profile, email: 'Email not available' })) || [];

    // Simple logic to count users per day of the week
    const counts = new Array(7).fill(0);
    users?.forEach((u) => {
        const day = new Date(u.created_at).getDay();
        counts[day] += 1;
    });


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
            <header className="flex justify-between items-center mb-8 bg-gray-50 px-5 py-5 rounded-2xl">
                <div className="relative w-96 ">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black " size={18} />
                    <Input className="pl-10 bg-white border-none shadow-sm text-sm rounded-2xl" placeholder="Search" />
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
                            <p className="text-sm">{user.email}</p>

                        </div>
                    </div>

                </div>
            </header>

            {/* Hero Section */}
            <div className="bg-gray-50 rounded-xl p-5">
                <div className="flex justify-between items-end mb-8 ">
                    <div>
                        <h1 className="text-2xl font-bold">Members</h1>
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
                <div className="flex flex-row gap-5">
                    <div>


                        <MembersModal initialUsers={allProfiles || []} />
                    </div>

                    <div className="flex flex-col gap-5">
                        <div className="w-150 h-80 bg-white rounded-xl">
                            <div className="flex justify-between items-center p-8 pb-4">
                                <p className="text-lg text-slate-900 font-semibold">Announcements</p>
                            </div>

                            <div className="text-center pt-15">
                                <Badge variant="outline" className="rounded-full px-4 py-1 mb-6 bg-white border-slate-200">
                                    <MessageSquare className="w-3 h-3 mr-2" /> Announce
                                </Badge>
                                <p className="text-sm">All of your public announcements will be listed here.</p>
                                <Button className="text-sm bg-white rounded-2xl border-1 border-black text-black hover:bg-black hover:text-white my-3">
                                    <Plus className="w-3 h-3 mr-2" /> Add Announcement
                                </Button>
                            </div>
                        </div>


                        <CommentsSection comments={comments || []} currentUser={profile} />

                    </div>
                </div>
            </div>

        </div>
    );
}