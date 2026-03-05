"use client";

import { Search, Bell, Mail, Plus, Import, ChevronLeft, ChevronRight, Eye, Trash } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from 'react';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";

import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { SignOutButton } from "@/components/signOutButton";
import { UserChart } from "@/components/admin/userChart";
import { ProfileForm } from "@/components/admin/profileForm";
import { AddScheduleButton } from "@/components/admin/addSchedule";
import { AddWeeklyPinButton } from "@/components/admin/addWeeklyPin";
import { EditWeeklyPinButton } from "@/components/admin/editWeeklyPin";
import { deleteWeeklyPin, deleteSchedule } from "@/app/actions/calendar";
import { toast } from "sonner";

export default function CalenderPage() {
    const [profile, setProfile] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(new Date());
    const [schedules, setSchedules] = useState([]);
    const [weeklyPins, setWeeklyPins] = useState([]);
    const [scheduledDates, setScheduledDates] = useState([]);
    const [taskDates, setTaskDates] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0); // To trigger re-fetch
    const router = useRouter();

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const d = new Date();
        d.setHours(hours);
        d.setMinutes(minutes);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

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
            setLoading(false);

            // Fetch schedules for selected date
            if (date) {
                const dateStr = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                const { data: scheduleData } = await supabase
                    .from('admin_schedules')
                    .select('*')
                    .eq('schedule_date', dateStr)
                    .order('start_time', { ascending: true });
                setSchedules(scheduleData || []);
            }

            // Fetch weekly pins
            const { data: pinsData } = await supabase
                .from('weekly_pins')
                .select('*')
                .order('day_of_week', { ascending: true });
            setWeeklyPins(pinsData || []);

            // Fetch all schedule dates for highlighting
            const { data: allSchedules } = await supabase
                .from('admin_schedules')
                .select('schedule_date');

            // Fetch all task due dates for highlighting
            const { data: allTasks } = await supabase
                .from('admin_todos')
                .select('due_date')
                .not('due_date', 'is', null);

            const parseDate = (dateStr) => {
                if (!dateStr) return undefined;
                const [year, month, day] = dateStr.split('-').map(Number);
                return new Date(year, month - 1, day);
            };

            setScheduledDates(allSchedules?.map(s => parseDate(s.schedule_date)).filter(Boolean) || []);
            setTaskDates(allTasks?.map(t => parseDate(t.due_date)).filter(Boolean) || []);
        };

        fetchData();
    }, [router, date, refreshKey]);

    const handleScheduleAdded = () => setRefreshKey(prev => prev + 1);

    const handleDeletePin = async (pinId) => {
        if (confirm("Are you sure you want to delete this pin?")) {
            const result = await deleteWeeklyPin(pinId);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Weekly pin deleted");
                setRefreshKey(prev => prev + 1);
            }
        }
    };

    const handleDeleteSchedule = async (scheduleId) => {
        if (confirm("Are you sure you want to delete this schedule?")) {
            const result = await deleteSchedule(scheduleId);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Schedule deleted");
                setRefreshKey(prev => prev + 1);
            }
        }
    };

    if (loading || !profile || !user) {
        // You can return a loading spinner here
        return null;
    }

    // Filter weekly pins for the selected date
    const currentDayOfWeek = date ? date.getDay() : -1;
    const dailyPins = weeklyPins.filter(pin => pin.day_of_week === currentDayOfWeek).map(pin => ({
        ...pin,
        start_time: null, // Pins are treated as all-day or timeless
        end_time: null,
        type: 'Weekly Pin',
        color: 'bg-purple-50 text-purple-600'
    }));

    const displaySchedules = [...dailyPins, ...schedules];

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
                        <h1 className="text-2xl font-bold">Calendar</h1>
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
                <div className="flex flex-col md:flex-row gap-8 p-8 bg-gray-50 min-h-screen">
                    {/* LEFT COLUMN: Calendar & Pinned Items */}
                    <div className="w-full md:w-[350px] space-y-6">
                        <Card className="border-none shadow-sm p-4">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md border-none"
                                modifiers={{
                                    scheduled: scheduledDates,
                                    taskDue: taskDates,
                                }}
                                modifiersClassNames={{
                                    scheduled: "bg-blue-50 text-blue-600 font-semibold hover:bg-blue-100 hover:text-blue-700",
                                    taskDue: "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-orange-500 after:rounded-full",
                                }}
                            />
                        </Card>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg text-gray-800">Weekly Pinned</h3>
                                <Button variant="link" className="text-blue-500 text-sm p-0">View all</Button>
                            </div>

                            {/* Pinned Items */}
                            {weeklyPins.map((item) => (
                                <Card key={item.id} className="border-none shadow-sm">
                                    <CardContent className="flex gap-2 items-start pt-4">
                                        <div className="w-6 h-6 bg-gray-100 rounded-lg" />
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <h4 className="font-semibold text-sm">{item.title}</h4>
                                                <Badge variant="secondary" className="bg-gray-100 border-none text-[10px]">{days[item.day_of_week]}</Badge>
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-1">{item.description}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <EditWeeklyPinButton pin={item} onPinUpdated={handleScheduleAdded} />
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-red-600" onClick={() => handleDeletePin(item.id)}>
                                                <Trash size={14} />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            <AddWeeklyPinButton onPinAdded={handleScheduleAdded} />
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Today's Schedule */}
                    <div className="flex-1 space-y-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-gray-400 text-sm">Today's Schedule</p>
                                <h2 className="text-3xl font-bold text-gray-900">{date ? date.toDateString() : 'Select a date'}</h2>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" className="rounded-full h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
                                <Button variant="outline" size="icon" className="rounded-full h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
                            </div>
                        </div>

                        <div className="mb-4">
                            <AddScheduleButton selectedDate={date} onScheduleAdded={handleScheduleAdded} />
                        </div>

                        <ScrollArea className="h-[calc(100vh-200px)] pr-4">
                            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-12 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">

                                {displaySchedules.length === 0 ? (
                                    <p className="text-sm text-gray-500 ml-16">No schedules for this day.</p>
                                ) : (
                                    displaySchedules.map((item) => (
                                        <div key={item.id} className="relative flex items-start gap-8">
                                            <div className="w-12 text-[10px] font-bold text-gray-400 pt-1">{item.start_time ? formatTime(item.start_time) : 'All Day'}</div>
                                            <Card className="flex-1 border-none shadow-sm">
                                                <CardContent className="p-6">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex gap-4">
                                                            <div className="w-12 h-12 bg-gray-100 rounded-xl" />
                                                            <div>
                                                                <h4 className="font-bold">{item.title}</h4>
                                                                <p className="text-xs text-gray-400">
                                                                    {item.start_time ? `${formatTime(item.start_time)}` : ''}
                                                                    {item.end_time ? ` - ${formatTime(item.end_time)}` : ''}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge className={`${item.color || 'bg-gray-100'} border-none`}>{item.type}</Badge>
                                                            {item.type !== 'Weekly Pin' && (
                                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-red-600" onClick={() => handleDeleteSchedule(item.id)}>
                                                                    <Trash size={14} />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {item.description && (
                                                        <div className="mt-2 pt-2 border-t text-xs text-gray-500">
                                                            {item.description}
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>
                                    ))
                                )}

                            </div>
                        </ScrollArea>
                    </div>
                </div>



            </div>
        </div>
    );
}