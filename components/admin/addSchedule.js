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
import { addSchedule } from "@/app/actions/calendar";
import { toast } from "sonner";

export function AddScheduleButton({ selectedDate, onScheduleAdded }) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    // Format date for input default value (YYYY-MM-DD)
    const dateStr = selectedDate ? new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0] : '';

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full bg-[#121217] hover:bg-black text-white rounded-xl py-6">
                    <Plus className="w-4 h-4 mr-2" /> Add New Schedule
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Schedule</DialogTitle>
                </DialogHeader>
                <form
                    action={async (formData) => {
                        const result = await addSchedule(formData);
                        if (result?.error) {
                            toast.error(result.error);
                        } else {
                            setOpen(false);
                            toast.success("Schedule added successfully");
                            if (onScheduleAdded) onScheduleAdded();
                            router.refresh();
                        }
                    }}
                    className="grid gap-4 py-4"
                >
                    <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" required placeholder="Meeting with team" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" placeholder="Details about the schedule..." />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="schedule_date">Date</Label>
                        <Input id="schedule_date" name="schedule_date" type="date" defaultValue={dateStr} required />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="grid gap-2">
                            <Label htmlFor="start_time">Start Time</Label>
                            <Input id="start_time" name="start_time" type="time" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="end_time">End Time</Label>
                            <Input id="end_time" name="end_time" type="time" />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="type">Type</Label>
                        <Select name="type" defaultValue="event">
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="event">Event</SelectItem>
                                <SelectItem value="meeting">Meeting</SelectItem>
                                <SelectItem value="task">Task</SelectItem>
                                <SelectItem value="personal">Personal</SelectItem>
                                <SelectItem value="work">Work</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="color">Color</Label>
                        <Select name="color" defaultValue="bg-blue-50 text-blue-600">
                            <SelectTrigger>
                                <SelectValue placeholder="Select color" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bg-blue-50 text-blue-600">Blue</SelectItem>
                                <SelectItem value="bg-green-50 text-green-600">Green</SelectItem>
                                <SelectItem value="bg-orange-50 text-orange-600">Orange</SelectItem>
                                <SelectItem value="bg-red-50 text-red-600">Red</SelectItem>
                                <SelectItem value="bg-purple-50 text-purple-600">Purple</SelectItem>
                                <SelectItem value="bg-gray-100 text-gray-600">Gray</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit" className="w-full bg-[#007AFF]">
                        Save Schedule
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
