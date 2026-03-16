
import { Plus, Import, MessageSquare } from 'lucide-react';
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button";
import { createClient, createAdminClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import React from 'react';
import MembersModal from "@/components/admin/userList.js";
import CommentsSection from "@/components/admin/commentsSection";
import { AdminHeader } from "@/components/admin/AdminHeader";




export default async function MembersPage() {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    // 1. Get the authenticated user from the session
    const { data: { user } } = await supabase.auth.getUser();

    // 2. If no user exists, send them to login
    if (!user) {
        redirect("/auth/login");
    }

    // 3. Fetch the admin's own profile to check role
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'admin') {
        redirect("/home?error=unauthorized");
    }

    // 4. Fetch all profiles AND all auth users to get emails
    // We use the adminSupabase (service role) to list auth users
    const [
        { data: allProfilesData, error: profilesError },
        { data: { users: authUsers }, error: authError }
    ] = await Promise.all([
        adminSupabase.from('profiles').select('id, full_name, role, avatar_url'),
        adminSupabase.auth.admin.listUsers()
    ]);

    if (profilesError || authError) {
        console.error('Error fetching data:', profilesError || authError);
    }

    // Merge email from Auth into Profiles
    const allProfiles = allProfilesData?.map(p => {
        const authUser = authUsers?.find(au => au.id === p.id);
        return {
            ...p,
            email: authUser?.email || 'N/A'
        };
    }) || [];

    // Fetch analytics data (users per day)
    const { data: usersCountData } = await adminSupabase.from('profiles').select('created_at').eq('role', 'user');

    // Fetch admin notes (comments)
    const { data: comments, error: commentsError } = await adminSupabase
        .from('user_comments')
        .select('*, author:profiles!author_id(full_name, avatar_url)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (commentsError) console.error("Error fetching comments:", commentsError);

    // Simple logic to count users per day of the week
    const counts = new Array(7).fill(0);
    usersCountData?.forEach((u) => {
        const day = new Date(u.created_at).getDay();
        counts[day] += 1;
    });


    // Analytics log
    console.log("Admin Profile Accessed:", profile.full_name);




    return (
        <div className="p-4 md:p-8 bg-white min-h-screen">
            <AdminHeader title="Members" profile={profile} user={user} />

            {/* Hero Section */}
            <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Members</h1>
                        <p className="text-gray-500 text-sm">Manage your community and team members.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button className="bg-black text-white hover:bg-white hover:text-black hover:border hover:border-black rounded-xl h-10">
                            <Plus className="mr-2" size={18} /> Create Content
                        </Button>
                        <Button variant="outline" className="bg-white rounded-xl h-10">
                            <Import className="mr-2" size={18} /> Import Data
                        </Button>
                    </div>
                </div>

                {/* Grid Content */}
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="w-full lg:flex-1 overflow-x-auto">
                        <MembersModal initialUsers={allProfiles || []} />
                    </div>

                    <div className="flex flex-col gap-6 w-full lg:w-96">
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-lg text-slate-900 font-semibold">Announcements</p>
                            </div>

                            <div className="text-center py-8">
                                <Badge variant="outline" className="rounded-full px-4 py-1 mb-6 bg-gray-50 border-slate-200">
                                    <MessageSquare className="w-3 h-3 mr-2" /> Announce
                                </Badge>
                                <p className="text-sm text-gray-500">All of your public announcements will be listed here.</p>
                                <Button className="text-sm bg-white rounded-2xl border border-black text-black hover:bg-black hover:text-white mt-6 w-full">
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