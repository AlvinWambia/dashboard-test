"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, MoreHorizontal, Pencil, Trash, CalendarDays } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { deleteTask, updateTask } from "@/app/actions/tasks";
import { toast } from "sonner";

const getPriorityBadgeClass = (priority) => {
    switch (priority?.toLowerCase()) {
        case 'high': return 'bg-red-50 text-red-600';
        case 'medium': return 'bg-yellow-50 text-yellow-600';
        case 'low': return 'bg-green-50 text-green-600';
        default: return 'bg-gray-100 text-gray-500';
    }
};

export function TaskCard({ task, profiles }) {
    const router = useRouter();
    const isDone = task.status === 'done';
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id, data: { type: 'Task', task } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none' // Prevent pull-to-refresh and native scroll on touch
    };

    // A simple window object check ensures we don't disable pointer listeners entirely,
    // but rather leverage CSS and pointer down stoppers for touch screens.
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    const handleDelete = () => {
        setIsDeleteOpen(true);
    };

    const confirmDelete = async () => {
        const deletePromise = async () => {
            const result = await deleteTask(task.id);
            if (result?.error) throw new Error(result.error);
        };

        toast.promise(deletePromise(), {
            loading: 'Deleting task...',
            success: () => {
                router.refresh();
                return 'Task deleted successfully';
            },
            error: (err) => err.message
        });
        setIsDeleteOpen(false);
    };

    return (
        <>
            <div ref={setNodeRef} style={style} {...attributes} {...(!isMobile ? listeners : {})}>
                <Card className="group relative">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <div className="flex flex-col gap-2">
                            <Badge className={getPriorityBadgeClass(task.priority)}><Settings size={16} /> {task.priority}</Badge>
                            <CardTitle className="text-sm">{task.title}</CardTitle>
                        </div>
                        <div onPointerDown={(e) => e.stopPropagation()}>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-32 p-0" align="end">
                                    <div className="flex flex-col">
                                        <Button variant="ghost" size="sm" className="justify-start font-normal" onClick={() => setIsEditOpen(true)} disabled={isDone} title={isDone ? "Cannot edit a completed task" : "Edit task"}>
                                            <Pencil className="mr-2 h-4 w-4" /> Edit
                                        </Button>
                                        <Button variant="ghost" size="sm" className="justify-start font-normal text-red-600 hover:text-red-600 hover:bg-red-50" onClick={handleDelete}>
                                            <Trash className="mr-2 h-4 w-4" /> Delete
                                        </Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">{task.description}</p>

                        {task.due_date && (
                            <div className="mt-2 flex items-center text-xs text-muted-foreground">
                                <CalendarDays className="mr-1 h-3 w-3" />
                                <span>Due by {new Date(task.due_date).toLocaleDateString()}</span>
                            </div>
                        )}

                        {task.assigned_to && (
                            <div className="mt-4 flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={task.assigned_to.avatar_url} />
                                    <AvatarFallback>{task.assigned_to.full_name?.[0]}</AvatarFallback>
                                </Avatar>
                                <span className="text-[10px]">{task.assigned_to.full_name}</span>
                                <span className="text-[10px]">{task.created_at}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Task</DialogTitle>
                    </DialogHeader>
                    <form action={async (formData) => {
                        const updatePromise = async () => {
                            const result = await updateTask(formData);
                            if (result?.error) throw new Error(result.error);
                        };

                        toast.promise(updatePromise(), {
                            loading: 'Updating task...',
                            success: () => {
                                setIsEditOpen(false);
                                router.refresh();
                                return 'Task updated successfully';
                            },
                            error: (err) => err.message
                        });
                    }} className="grid gap-4 py-4">
                        <input type="hidden" name="id" value={task.id} />
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" name="title" defaultValue={task.title} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" defaultValue={task.description} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select name="status" defaultValue={task.status}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="yet_to_do">To Do</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="done">Done</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select name="priority" defaultValue={task.priority}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="assigned_to">Assign To</Label>
                            <Select name="assigned_to" defaultValue={task.assigned_to?.id || ""}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select user" />
                                </SelectTrigger>
                                <SelectContent>
                                    {profiles?.map((profile) => (
                                        <SelectItem key={profile.id} value={profile.id}>{profile.full_name || "Unknown"}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="due_date">Due Date</Label>
                            <Input
                                id="due_date"
                                name="due_date"
                                type="date"
                                defaultValue={task.due_date ? task.due_date.split('T')[0] : ''}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Task</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this task? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}