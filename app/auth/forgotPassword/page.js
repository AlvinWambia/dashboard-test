"use client"

import "@/app/globals.css";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import daImage from "@/components/images/da.png"
import { ArrowUpIcon, ArrowLeft } from "lucide-react"
import { useState } from "react";
import { createClient } from "@/supabase/client";
import { getURL } from "@/lib/getURL";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const supabase = createClient();

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: getURL('/auth/update-password'),
        });

        if (error) {
            setError(error.message);
        } else {
            setMessage("Check your email for the password reset link.");
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-md lg:max-w-4xl xl:max-w-5xl grid lg:grid-cols-2 lg:min-h-[40rem] rounded-3xl shadow-2xl bg-white overflow-hidden">
                {/* LEFT SIDE: Image & Testimonial */}
                <div className="relative h-full w-full hidden bg-muted lg:block">
                    <Image
                        src={daImage.src}
                        alt="Testimonial background"
                        fill
                        className="object-cover brightness-[0.7]"
                    />

                    <div className="absolute top-4 left-4 sm:top-10 sm:left-10 flex items-center gap-4">
                        <Button variant="outline">Homepage</Button>
                        <Button variant="outline" size="icon" aria-label="Back to top">
                            <ArrowUpIcon className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="absolute bottom-10 left-10 right-10 text-white">
                        <blockquote className="space-y-2">
                            <p className="text-2xl font-medium leading-tight">
                                &ldquo;Simply the tools that my team and I need.&rdquo;
                            </p>
                            <footer className="text-sm pb-5">
                                <div className="font-semibold">Alvin Wambia</div>
                                <div className="text-white/80">Software Developer</div>
                            </footer>
                        </blockquote>
                    </div>
                </div>

                {/* RIGHT SIDE: Form */}
                <div className="flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12 w-full">
                    <div className="mx-auto flex w-full flex-col justify-center space-y-6 max-w-sm">

                        {/* Logo & Header */}
                        <div className="flex flex-col space-y-2 text-center">
                            <div className="flex items-center justify-center font-bold text-2xl mb-4">
                                <span className="mr-2">⠿</span> FitWithP
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight">Forgot Password</h1>
                            <p className="text-sm text-muted-foreground">
                                Enter your email address and we'll send you a link to reset your password.
                            </p>
                        </div>

                        {/* Form Fields */}
                        <form onSubmit={handleResetPassword} className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="alex.jordan@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="min-h-5 text-sm">
                                {error && (
                                    <p className="text-red-500 animate-in fade-in-0 slide-in-from-top-1 duration-300">
                                        {error}
                                    </p>
                                )}
                                {message && (
                                    <p className="text-green-500 animate-in fade-in-0 slide-in-from-top-1 duration-300">
                                        {message}
                                    </p>
                                )}
                            </div>

                            <Button type="submit" disabled={loading} className="w-full bg-white text-black border border-black hover:bg-black hover:text-white text-lg py-3">
                                {loading ? "Sending..." : "Send Reset Link"}
                            </Button>
                        </form>

                        {/* Footer Link */}
                        <div className="text-center text-sm">
                            <Link href="/auth/login" className="font-semibold text-black hover:underline flex items-center justify-center gap-2">
                                <ArrowLeft className="w-4 h-4" /> Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
