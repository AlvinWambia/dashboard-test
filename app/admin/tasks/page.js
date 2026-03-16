"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable,
} from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import { Import, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"
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
import { updateTaskStatus, updateTaskOrder } from "@/app/actions/tasks";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin/AdminHeader";


function TaskColumn({ column, tasks, isExpanded, toggleShowMore, allProfiles }) {
    const { setNodeRef } = useDroppable({
        id: column.id,
    });

    const visibleTasks = isExpanded ? tasks : tasks.slice(0, 3);

    return (
        <div ref={setNodeRef} className="w-full lg:w-80 flex-shrink-0">
            <div className="flex flex-row bg-gray-100 rounded-lg px-3 py-2 my-4">
                <h3 className="font-semibold text-sm">{column.title}</h3>
            </div>
            <SortableContext id={column.id} items={tasks.map(t => t.id)}>
                <div className="space-y-3 min-h-[50px]">
                    {visibleTasks.map((task) => (
                        <TaskCard key={task.id} task={task} profiles={allProfiles} />
                    ))}
                </div>
            </SortableContext>
            {tasks.length > 3 && (
                <Button variant="link" className="w-full mt-2 text-blue-600 hover:text-blue-800 justify-start px-0" onClick={() => toggleShowMore(column.id)}>
                    {isExpanded ? 'Show Less' : `+ ${tasks.length - 3} more`}
                </Button>
            )}
        </div>
    );
}

export default function TasksPage() {
    const [profile, setProfile] = useState(null);
    const [user, setUser] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [allProfiles, setAllProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('recent');
    const [filterPriority, setFilterPriority] = useState('all');
    const [expandedColumns, setExpandedColumns] = useState({});
    const [activeTask, setActiveTask] = useState(null);
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

    const columns = [
        { id: 'yet_to_do', title: 'To Do', color: 'bg-blue-50', dot: 'bg-blue-500' },
        { id: 'in_progress', title: 'In Progress', color: 'bg-orange-50', dot: 'bg-orange-500' },
        { id: 'done', title: 'Done', color: 'bg-green-50', dot: 'bg-green-500' },
    ];

    const toggleShowMore = (columnId) => {
        setExpandedColumns(prev => ({
            ...prev,
            [columnId]: !prev[columnId]
        }));
    };

    const getPriorityBadgeClass = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'bg-red-50 text-red-600';
            case 'medium': return 'bg-yellow-50 text-yellow-600';
            case 'low': return 'bg-green-50 text-green-600';
            default: return 'bg-gray-100 text-gray-500';
        }
    };

    const filteredAndSortedTasks = useMemo(() => {
        if (!tasks) return [];

        let processedTasks = [...tasks];

        // 1. Filter by priority
        if (filterPriority !== 'all') {
            processedTasks = processedTasks.filter(task => task.priority?.toLowerCase() === filterPriority);
        }

        // 2. Sort by date
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

    const tasksByStatus = filteredAndSortedTasks.reduce((acc, task) => {
        const status = task.status || 'yet_to_do'; // Default to 'yet_to_do' if status is null
        if (!acc[status]) {
            acc[status] = [];
        }
        acc[status].push(task);
        return acc;
    }, {});

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // 5px drag threshold
            },
        })
    );

    function handleDragStart(event) {
        const { active } = event;
        const task = tasks.find(t => t.id === active.id);
        setActiveTask(task);
    }

    async function handleDragEnd(event) {
        const { active, over } = event;
        setActiveTask(null); // Clear the drag overlay

        if (!over || active.id === over.id) return;

        const activeId = String(active.id);
        const overId = String(over.id);

        const activeContainer = active.data.current?.sortable?.containerId;
        const overContainer = over.data.current?.sortable?.containerId || over.id;

        // 1. Optimistic UI Update
        const newTasks = (() => {
            let newItems = [...tasks];
            const oldIndex = newItems.findIndex((t) => t.id === activeId);

            if (oldIndex === -1) return tasks;

            if (activeContainer !== overContainer) {
                newItems[oldIndex] = { ...newItems[oldIndex], status: overContainer };
            }

            const newIndex = newItems.findIndex((t) => t.id === overId);

            if (newIndex !== -1) {
                newItems = arrayMove(newItems, oldIndex, newIndex);
            }
            return newItems;
        })();

        setTasks(newTasks);

        // 2. Database Update
        if (activeContainer === overContainer) {
            // Case 1: Reordering within the same column
            const tasksInColumn = newTasks.filter(t => t.status === activeContainer);
            const updates = tasksInColumn.map((task, index) => ({
                id: task.id,
                position: index,
            }));
            const result = await updateTaskOrder(updates);
            if (result?.error) toast.error(result.error);
        } else {
            // Case 2: Moving to a different column
            const result = await updateTaskStatus(activeId, overContainer);
            if (result?.error) {
                toast.error(result.error);
                // Optional: You could trigger a router.refresh() here to revert the UI if it failed
                return;
            }

            // Update positions for both the old and new columns
            const oldColumnTasks = newTasks.filter(t => t.status === activeContainer);
            const oldColumnUpdates = oldColumnTasks.map((task, index) => ({ id: task.id, position: index }));

            const newColumnTasks = newTasks.filter(t => t.status === overContainer);
            const newColumnUpdates = newColumnTasks.map((task, index) => ({ id: task.id, position: index }));

            const orderResult = await updateTaskOrder([...oldColumnUpdates, ...newColumnUpdates]);
            if (orderResult?.error) toast.error(orderResult.error);
        }
        router.refresh();
    }

    if (loading || !profile || !user) {
        // Return null to avoid showing a loading screen while data is being fetched.
        return null;
    }

    return (
        <div className="p-4 md:p-8 bg-white min-h-screen">
            <AdminHeader title="Task Manager" profile={profile} user={user} />

            {/* Hero Section */}
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
                        <p className="text-gray-500 text-sm">Organize and track your team's administrative tasks.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline" className="bg-white shadow-sm rounded-xl h-10">
                            <Import className="mr-2" size={16} /> Import
                        </Button>
                        <AddTaskButton profiles={allProfiles} />
                    </div>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Label htmlFor="sort-by" className="text-sm font-medium text-gray-600 min-w-fit">Sort by</Label>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger id="sort-by" className="w-full sm:w-[150px] bg-white shadow-sm border-gray-200 rounded-xl">
                                <SelectValue placeholder="Sort order" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="recent">Most Recent</SelectItem>
                                <SelectItem value="oldest">Oldest</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Label htmlFor="filter-priority" className="text-sm font-medium text-gray-600 min-w-fit">Priority</Label>
                        <Select value={filterPriority} onValueChange={setFilterPriority}>
                            <SelectTrigger id="filter-priority" className="w-full sm:w-[150px] bg-white shadow-sm border-gray-200 rounded-xl">
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Board Container */}
                <DndContext
                    sensors={sensors}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="bg-white rounded-xl p-4 border shadow-sm flex flex-col lg:flex-row gap-4 lg:overflow-x-auto">
                        {columns.map((column) => {
                            const tasksForColumn = tasksByStatus[column.id] || [];
                            const isExpanded = expandedColumns[column.id];

                            return (
                                <TaskColumn
                                    key={column.id}
                                    column={column}
                                    tasks={tasksForColumn}
                                    isExpanded={isExpanded}
                                    toggleShowMore={toggleShowMore}
                                    allProfiles={allProfiles}
                                />
                            );
                        })}
                    </div>
                    {createPortal(
                        <DragOverlay>
                            {activeTask && <TaskCard task={activeTask} profiles={allProfiles} />}
                        </DragOverlay>,
                        document.body
                    )}
                </DndContext>
            </div>
        </div>
    );
}