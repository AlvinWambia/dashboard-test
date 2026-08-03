"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AddTaskButton } from "@/components/admin/addTask";
import { TaskCard } from "@/components/admin/TaskCard";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Accordion } from "@/components/ui/accordion";

export default function TasksPage() {
    const [profile, setProfile] = useState(null);
    const [user, setUser] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [allProfiles, setAllProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('recent');
    const [filterPriority, setFilterPriority] = useState('all');
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

            if (!profileData) {
                return;
            }
            setProfile(profileData);

            const { data: allProfilesData } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url');
            setAllProfiles(allProfilesData || []);

            const { data: tasksData, error: tasksError } = await supabase
                .from('admin_todos')
                .select(`
                    *,
                    assigned_to:profiles!assigned_to(id, full_name, avatar_url)
                `)
                .order('position', { ascending: true });

            if (tasksError) {
                console.error("Supabase error fetching tasks:", tasksError.message);
            } else {
                setTasks(tasksData || []);
            }
            setLoading(false);
        };

        fetchData();
    }, [router]);

    const filteredAndSortedTasks = useMemo(() => {
        if (!tasks) return [];

        let processedTasks = [...tasks];

        if (filterPriority !== 'all') {
            processedTasks = processedTasks.filter(task => task.priority?.toLowerCase() === filterPriority);
        }

        processedTasks.sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            if (sortBy === 'recent') {
                return dateB - dateA;
            } else {
                return dateA - dateB;
            }
        });

        return processedTasks;
    }, [tasks, sortBy, filterPriority]);

    if (loading || !profile || !user) {
        return null;
    }

    return (
        <div className="p-4 md:p-8 bg-white min-h-screen">
            <AdminHeader title="Task Manager" profile={profile} user={user} />

            <div className="bg-white rounded-3xl p-6 border-t border-gray-50 mt-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">All Tasks</h1>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <AddTaskButton profiles={allProfiles} />
                    </div>
                </div>

                <div className="w-full">
                    <Accordion type="multiple" className="w-full space-y-2">
                        {filteredAndSortedTasks.map((task) => (
                            <TaskCard key={task.id} task={task} profiles={allProfiles} />
                        ))}
                    </Accordion>
                </div>
            </div>
        </div>
    );
}