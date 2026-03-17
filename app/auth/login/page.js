"use client"

import "@/app/globals.css";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import daImage from "@/components/images/da.png"
import githubImage from "@/components/images/github.jpg"
import appleImage from "@/components/images/apple.jpg"
import googleImage from "@/components/images/google1.jpg"
import { ArrowUpIcon } from "lucide-react"
import { useState } from "react";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";
import { getURL } from "@/lib/getURL";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // 1. Authenticate the user
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        // 2. Fetch the user's role from your custom profiles table
        // We use .single() because we expect exactly one profile per user ID
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

        if (profileError) {
            console.error("Error fetching profile:", profileError);
            // Fallback to home2 if profile lookup fails
            router.replace('/home2');
            setLoading(false);
            return;
        }

        // 3. Redirect based on the database role
        if (profile?.role === 'admin') {
            router.replace('/admin/dashboard');
        } else {
            router.replace('/home2?signed_in=true');
        }

        setLoading(false);
    };

    const handleGoogleSignIn = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: getURL('/auth/callback?next=/home2?signed_in=true'),
            },
        });
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

                {/* RIGHT SIDE: Login Form */}
                <div className="flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12 w-full">
                    <div className="mx-auto flex w-full flex-col justify-center space-y-6 max-w-sm">

                        {/* Logo & Header */}
                        <div className="flex flex-col space-y-2 text-center">
                            <div className="flex items-center justify-center font-bold text-2xl mb-4">
                                <span className="mr-2">⠿</span> myFitPal
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight">Welcome back to myFit</h1>
                            <p className="text-sm text-muted-foreground">
                                Build your design system effortlessly with our powerful component library.
                            </p>
                        </div>

                        {/* Form Fields */}
                        <form onSubmit={handleLogin} className="grid gap-4">
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
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <Link href="/auth/updatepassword" className="text-sm font-medium text-blue-600 hover:underline">
                                        Forgot password?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Your password..."
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex items-center space-x-2 py-2">
                                <Checkbox id="remember" />
                                <label htmlFor="remember" className="text-sm text-muted-foreground leading-none">
                                    Remember sign in details
                                </label>
                            </div>

                            <div className="h-5 text-sm text-red-500">
                                {error && (
                                    <p className="animate-in fade-in-0 slide-in-from-top-1 duration-300">
                                        {error}
                                    </p>
                                )}
                            </div>

                            <Button type="submit" disabled={loading} className="w-full bg-white text-black border border-black hover:bg-black hover:text-white text-lg py-3">
                                {loading ? "Logging in..." : "Log in"}
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">OR</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                                <Image src={googleImage.src} alt="Google" width={20} height={20} className="mr-2" />
                                Google
                            </Button>

                            <Button variant="outline" className="w-full">
                                <Image src={githubImage.src} alt="GitHub" width={20} height={20} className="mr-2" />
                                GitHub
                            </Button>

                            <Button variant="outline" className="w-full">
                                <Image src={appleImage.src} alt="Apple" width={20} height={20} className="mr-2" />
                                Apple
                            </Button>

                        </div>
                        {/* Social Login */}


                        {/* Footer Link */}
                        <p className="text-center text-sm text-muted-foreground">
                            Don&apos;t have an account?{" "}
                            <Link href="/auth/signup" className="font-semibold pb-5 text-black hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}