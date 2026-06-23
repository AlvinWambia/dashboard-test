"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash, CalendarDays, AlignLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { deleteTask, updateTask } from "@/app/actions/tasks";
import { toast } from "sonner";

const getPriorityStyle = (priority) => {
    switch (priority?.toLowerCase()) {
        case 'high': return { bg: 'bg-yellow-50', text: 'text-yellow-600', dot: 'bg-yellow-400' };
        case 'medium': return { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-400' };
        case 'low': return { bg: 'bg-green-50', text: 'text-green-600', dot: 'bg-green-400' };
        default: return { bg: 'bg-gray-50', text: 'text-gray-500', dot: 'bg-gray-400' };
    }
};

export function TaskCard({ task, profiles }) {
    const router = useRouter();
    const isDone = task.status === 'done';
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    
    const handleDelete = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDeleteOpen(true);
    };

    const handleCheckboxChange = async (checked) => {
        const updatePromise = async () => {
            const formData = new FormData();
            formData.append('id', task.id);
            formData.append('status', checked ? 'done' : 'yet_to_do');
            const result = await updateTask(formData);
            if (result?.error) throw new Error(result.error);
        };

        toast.promise(updatePromise(), {
            loading: 'Updating task status...',
            success: () => {
                router.refresh();
                return 'Status updated';
            },
            error: (err) => err.message
        });
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

    const priorityStyle = getPriorityStyle(task.priority);

    return (
        <>
            <AccordionItem value={task.id} className="border-b border-gray-100 py-1 border-x-0 border-t-0 bg-white">
                <div className="flex items-center w-full gap-4 px-2">
                    <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-center shrink-0">
                        <Checkbox 
                            checked={isDone} 
                            onCheckedChange={handleCheckboxChange} 
                            className="w-5 h-5 rounded border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black"
                        />
                    </div>
                    
                    <AccordionTrigger className="flex-1 hover:no-underline py-4 items-center min-w-0 [&[data-state=open]>svg]:rotate-180">
                        <div className="flex items-center justify-between w-full pr-4 min-w-0">
                            <div className="flex flex-col items-start gap-1 min-w-0 pr-4">
                                <div className="flex items-center text-xs text-gray-400 gap-1.5 font-medium shrink-0">
                                    <AlignLeft className="w-3.5 h-3.5" />
                                    <span>{task.category || 'General Task'}</span>
                                </div>
                                <span className={`text-[15px] font-semibold truncate w-full text-left ${isDone ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                    {task.title}
                                </span>
                            </div>
                            
                            <div className="flex items-center justify-end w-[100px] shrink-0">
                                <div className={`flex items-center justify-center gap-2 px-3 py-1 rounded-full border border-gray-50 w-full ${priorityStyle.bg}`}>
                                    <div className={`w-2 h-2 rounded-full shrink-0 ${priorityStyle.dot}`}></div>
                                    <span className={`text-xs font-semibold ${priorityStyle.text}`}>
                                        {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Normal'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </AccordionTrigger>
                    
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg shrink-0 -ml-2"
                        onClick={handleDelete}
                    >
                        <Trash className="w-4 h-4" />
                    </Button>
                </div>

                <AccordionContent className="pt-2 pb-4 pl-12 pr-14">
                    <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">{task.description || "No description provided."}</p>
                        
                        <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
                            <div className="flex items-center gap-6">
                                {task.due_date && (
                                    <div className="flex items-center text-xs text-gray-500 font-medium">
                                        <CalendarDays className="mr-2 h-4 w-4" />
                                        <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                                    </div>
                                )}
                                
                                {task.assigned_to && (
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={task.assigned_to.avatar_url} />
                                            <AvatarFallback>{task.assigned_to.full_name?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs text-gray-500 font-medium">{task.assigned_to.full_name}</span>
                                    </div>
                                )}
                            </div>
                            
                            <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)} disabled={isDone} className="rounded-xl font-medium">
                                Edit Task
                            </Button>
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>

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
                            <Label htmlFor="category">Category</Label>
                            <Input id="category" name="category" defaultValue={task.category || ''} placeholder="e.g. Odama Website" />
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