"use client";

import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { deleteSchedule, approveMeetingRequest } from "@/app/actions/calendar";
import { toast } from "sonner";
import { CheckCircle, Trash, Clock, CalendarIcon, Inbox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RequestsPage() {
    const [profile, setProfile] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                router.push("/auth/login");
                return;
            }
            setUser(user);

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (!profileData || profileData.role !== 'admin') {
                router.push("/home?error=unauthorized");
                return;
            }
            setProfile(profileData);

            // Fetch schedules that are meeting related
            const { data: schedulesData } = await supabase
                .from('admin_schedules')
                .select('*')
                .in('type', ['Pending Meeting', 'Meeting'])
                .order('schedule_date', { ascending: true })
                .order('start_time', { ascending: true });

            setRequests(schedulesData || []);
            setLoading(false);
        };

        fetchData();
    }, [router, refreshKey]);

    const handleApprove = async (scheduleId) => {
        const result = await approveMeetingRequest(scheduleId);
        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Meeting approved successfully");
            setRefreshKey(prev => prev + 1);
        }
    };

    const handleDecline = async (scheduleId) => {
        if (confirm("Are you sure you want to decline and delete this request?")) {
            const result = await deleteSchedule(scheduleId);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Request declined and removed");
                setRefreshKey(prev => prev + 1);
            }
        }
    };

    if (loading || !profile || !user) {
        return null; // or loading spinner
    }

    const pendingRequests = requests.filter(req => req.type === 'Pending Meeting');
    const approvedRequests = requests.filter(req => req.type === 'Meeting');

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const d = new Date();
        d.setHours(hours);
        d.setMinutes(minutes);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const RequestList = ({ items, isPending }) => {
        if (items.length === 0) {
            return (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm mt-4">
                    <Inbox className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-gray-500">No {isPending ? 'pending' : 'approved'} meeting requests.</p>
                </div>
            );
        }

        return (
            <div className="space-y-4 mt-4">
                {items.map(req => (
                    <Card key={req.id} className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                            <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-lg text-gray-900">{req.title}</h3>
                                    <Badge variant={isPending ? "outline" : "default"} className={isPending ? "text-orange-500 border-orange-200 bg-orange-50" : "bg-green-500 hover:bg-green-600 text-white border-transparent"}>
                                        {req.type}
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-medium">
                                    <div className="flex items-center gap-1.5">
                                        <CalendarIcon className="h-4 w-4 text-blue-500" />
                                        {new Date(req.schedule_date).toDateString()}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-4 w-4 text-purple-500" />
                                        {req.start_time ? formatTime(req.start_time) : 'All Day'}
                                    </div>
                                </div>
                                {req.description && (
                                    <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-xl border border-gray-100">{req.description}</p>
                                )}
                            </div>
                            
                            <div className="flex gap-3 w-full md:w-auto pt-2 md:pt-0">
                                {isPending && (
                                    <Button onClick={() => handleApprove(req.id)} className="flex-1 md:flex-none bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-sm">
                                        <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                    </Button>
                                )}
                                <Button onClick={() => handleDecline(req.id)} variant="outline" className="flex-1 md:flex-none text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 rounded-xl">
                                    <Trash className="mr-2 h-4 w-4" /> {isPending ? 'Decline' : 'Cancel'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    return (
        <div className="p-4 md:p-8 bg-white min-h-screen">
            <AdminHeader title="Requests" profile={profile} user={user} />

            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 mb-8 mt-6">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Meeting Requests</h1>
                    <p className="text-gray-500 text-sm mt-1">Review and manage booking requests from users.</p>
                </div>

                <Tabs defaultValue="pending" className="w-full">
                    <TabsList className="mb-2 grid w-full md:w-[400px] grid-cols-2 bg-white border shadow-sm rounded-xl p-1">
                        <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-gray-100 data-[state=active]:text-black">
                            Pending ({pendingRequests.length})
                        </TabsTrigger>
                        <TabsTrigger value="approved" className="rounded-lg data-[state=active]:bg-gray-100 data-[state=active]:text-black">
                            Approved ({approvedRequests.length})
                        </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="pending" className="outline-none mt-0">
                        <RequestList items={pendingRequests} isPending={true} />
                    </TabsContent>
                    
                    <TabsContent value="approved" className="outline-none mt-0">
                        <RequestList items={approvedRequests} isPending={false} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
