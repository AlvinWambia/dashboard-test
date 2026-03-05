"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { addTask } from "@/app/actions/tasks";
import { toast } from "sonner";

export function AddTaskButton({ profiles }) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[#007AFF] hover:bg-blue-700 text-white rounded-lg px-4 shadow-sm">
                    <Plus className="w-4 h-4 mr-2" /> Add new task
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                </DialogHeader>
                <form
                    action={async (formData) => {
                        const result = await addTask(formData);
                        if (result?.error) {
                            toast.error(result.error);
                        } else {
                            setOpen(false); // Close modal on success
                            toast.success("Task created successfully");
                            router.refresh();
                        }
                    }}
                    className="grid gap-4 py-4"
                >
                    <div className="grid gap-2">
                        <Label htmlFor="title">Task Title</Label>
                        <Input id="title" name="title" placeholder="e.g. Design Login Page" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" placeholder="Briefly describe the task..." />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select name="priority" defaultValue="medium">
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
                        <Select name="assigned_to">
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
                        <Label htmlFor="due_date">Due Date (Optional)</Label>
                        <Input id="due_date" name="due_date" type="date" />
                    </div>
                    <Button type="submit" className="w-full bg-[#007AFF]">
                        Create Task
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}