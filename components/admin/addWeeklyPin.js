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
import { addWeeklyPin } from "@/app/actions/calendar";
import { toast } from "sonner";

export function AddWeeklyPinButton({ onPinAdded }) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full bg-[#121217] hover:bg-black text-white rounded-xl py-6">
                    <Plus className="w-4 h-4 mr-2" /> Add New Weekly Pin
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Weekly Pin</DialogTitle>
                </DialogHeader>
                <form
                    action={async (formData) => {
                        const result = await addWeeklyPin(formData);
                        if (result?.error) {
                            toast.error(result.error);
                        } else {
                            setOpen(false);
                            toast.success("Weekly pin added successfully");
                            if (onPinAdded) onPinAdded();
                            router.refresh();
                        }
                    }}
                    className="grid gap-4 py-4"
                >
                    <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" required placeholder="Weekly Team Sync" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" placeholder="Details about the pin..." />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="day_of_week">Day of Week</Label>
                        <Select name="day_of_week" defaultValue="1">
                            <SelectTrigger>
                                <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">Sunday</SelectItem>
                                <SelectItem value="1">Monday</SelectItem>
                                <SelectItem value="2">Tuesday</SelectItem>
                                <SelectItem value="3">Wednesday</SelectItem>
                                <SelectItem value="4">Thursday</SelectItem>
                                <SelectItem value="5">Friday</SelectItem>
                                <SelectItem value="6">Saturday</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit" className="w-full bg-[#007AFF]">
                        Save Pin
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
