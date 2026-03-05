"use client" // This makes interactivity work!

import { Button } from "@/components/ui/button";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

export function SignOutButton() {
    const supabase = createClient();
    const router = useRouter();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh(); // Refresh the server component state
        router.push("/auth/login");
    };

    return (
        <HoverCard>
            <HoverCardTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleSignOut} className="bg-white rounded-full shadow-sm text-sm"><LogOut size={20} /></Button>
            </HoverCardTrigger>
            <HoverCardContent>
                <p>Sign Out</p>
            </HoverCardContent>
        </HoverCard>

    );
} 