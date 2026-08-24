"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { signOutAction } from "@/app/actions/auth";

export function SignOutButton({ variant = "ghost", className, showText = false, text = "Log Out" }) {
    const supabase = createClient();
    const router = useRouter();
    const [isSigningOut, setIsSigningOut] = useState(false);

    const handleSignOut = async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (isSigningOut) return;

        setIsSigningOut(true);
        try {
            // 1. Fire-and-forget client-side sign out to avoid network hangs
            // We do not await this because Supabase client auth requests can sometimes hang indefinitely.
            supabase.auth.signOut().catch(console.error);

            // 2. Clear local & session storage
            if (typeof window !== "undefined") {
                window.localStorage.clear();
                window.sessionStorage.clear();
            }

            // 3. Sign out on server side (clears auth cookies). This is the source of truth.
            await signOutAction();

            // 4. Navigate — AFTER server cookies are cleared so middleware won't bounce back
            window.location.href = "/auth/login";
        } catch (err) {
            console.error("Sign out error:", err);
            // Fallback forced logout if everything else fails
            if (typeof window !== "undefined") {
                window.location.href = "/auth/login";
            }
            setIsSigningOut(false);
        }
    };

    if (showText) {
        return (
            <Button
                variant={variant}
                onClick={handleSignOut}
                disabled={isSigningOut}
                className={className || "w-full flex items-center justify-start gap-2.5 rounded-xl transition-all text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-100 bg-white shadow-sm px-4 py-2 cursor-pointer disabled:opacity-60"}
            >
                {isSigningOut ? (
                    <Loader2 size={18} className="animate-spin text-red-600" />
                ) : (
                    <LogOut size={18} />
                )}
                <span>{isSigningOut ? "Logging out..." : text}</span>
            </Button>
        );
    }

    return (
        <HoverCard>
            <HoverCardTrigger asChild>
                <Button
                    variant={variant}
                    size="icon"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className={className || "bg-white rounded-full shadow-sm border border-gray-100 h-10 w-10 text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-60"}
                    aria-label="Log Out"
                >
                    {isSigningOut ? (
                        <Loader2 size={18} className="animate-spin text-red-600" />
                    ) : (
                        <LogOut size={18} />
                    )}
                </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-auto py-1 px-3 text-xs font-semibold">
                Log Out
            </HoverCardContent>
        </HoverCard>
    );
} 