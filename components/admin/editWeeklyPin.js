"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
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
import { updateWeeklyPin } from "@/app/actions/calendar";
import { toast } from "sonner";

export function EditWeeklyPinButton({ pin, onPinUpdated }) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-blue-600">
                    <Pencil size={14} />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Weekly Pin</DialogTitle>
                </DialogHeader>
                <form
                    action={async (formData) => {
                        const result = await updateWeeklyPin(formData);
                        if (result?.error) {
                            toast.error(result.error);
                        } else {
                            setOpen(false);
                            toast.success("Weekly pin updated successfully");
                            if (onPinUpdated) onPinUpdated();
                            router.refresh();
                        }
                    }}
                    className="grid gap-4 py-4"
                >
                    <input type="hidden" name="id" value={pin.id} />
                    <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" required defaultValue={pin.title} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" defaultValue={pin.description} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="day_of_week">Day of Week</Label>
                        <Select name="day_of_week" defaultValue={String(pin.day_of_week)}>
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
                        Save Changes
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
