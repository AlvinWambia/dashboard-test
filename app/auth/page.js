"use client"

import "@/app/globals.css";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import daImage from "@/components/images/da.png"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import { useState, useEffect } from "react";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";
import zxcvbn from "zxcvbn"
import { z } from "zod";

const updatePasswordSchema = z.object({
    password: z.string().min(10, { message: "Password must be at least 10 characters." })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
        .regex(/[0-9]/, { message: "Password must contain at least one number." })
        .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character." }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [strength, setStrength] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const colors = ["#ff4d4f", "#fa8c16", "#fadb14", "#52c41a", "#237804"];
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setMessage("You can now update your password.");
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase.auth]);

    useEffect(() => {
        const validationResult = updatePasswordSchema.safeParse({
            password,
            confirmPassword,
        });

        if (!validationResult.success) {
            setErrors(validationResult.error.flatten().fieldErrors);
        } else {
            setErrors({});
        }
    }, [password, confirmPassword]);

    const handleChange = (value) => {
        setPassword(value)
        const result = zxcvbn(value)
        setStrength(result.score)
    }

    const strengthText = [
        "Very Weak",
        "Weak",
        "Fair",
        "Strong",
        "Very Strong",
    ]

    const handleBlur = (field) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        setLoading(true);

        setTouched({
            password: true,
            confirmPassword: true,
        });

        const validationResult = updatePasswordSchema.safeParse({
            password,
            confirmPassword,
        });

        if (!validationResult.success) {
            setErrors(validationResult.error.flatten().fieldErrors);
            setLoading(false);
            return;
        }

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            setError(error.message);
        } else {
            setMessage("Your password has been updated successfully. Redirecting to login...");
            setTimeout(() => {
                router.push("/auth/login");
            }, 2000);
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-md lg:max-w-4xl xl:max-w-5xl grid lg:grid-cols-2 lg:min-h-[40rem] rounded-3xl shadow-2xl bg-white overflow-hidden">
                {/* LEFT SIDE */}
                <div className="relative h-full w-full hidden bg-muted lg:block">
                    <Image
                        src={daImage.src}
                        alt="Update password background"
                        fill
                        className="object-cover brightness-[0.7]"
                    />
                    <div className="absolute top-4 left-4 sm:top-10 sm:left-10 flex items-center gap-4">
                        <Link href="/home2">
                            <Button variant="outline">Homepage</Button>
                        </Link>
                    </div>
                    <div className="absolute bottom-10 left-10 right-10 text-white">
                        <blockquote className="space-y-2">
                            <p className="text-2xl font-medium leading-tight">
                                &ldquo;Security is not a product, but a process.&rdquo;
                            </p>
                            <footer className="text-sm pb-5">
                                <div className="font-semibold">Bruce Schneier</div>
                            </footer>
                        </blockquote>
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12 w-full">
                    <div className="mx-auto flex w-full flex-col justify-center space-y-6 max-w-sm">
                        <div className="flex flex-col space-y-2 text-center">
                            <div className="flex items-center justify-center font-bold text-2xl mb-4">
                                <span className="mr-2">⠿</span> FitWithP
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight">Update Your Password</h1>
                            <p className="text-sm text-muted-foreground">
                                Enter your new password below.
                            </p>
                        </div>

                        <form onSubmit={handleUpdatePassword} className="grid gap-4">
                            <div className="grid gap-1.5">
                                <Label htmlFor="password">New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        placeholder="New password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => { handleChange(e.target.value); setTouched((prev) => ({ ...prev, password: true })); }}
                                        onBlur={() => handleBlur("password")}
                                        className="pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {password && (
                                    <div className="mt-1 space-y-2">
                                        <div className="flex gap-1 h-1.5">
                                            {[0, 1, 2, 3].map((i) => (
                                                <div
                                                    key={i}
                                                    className="flex-1 rounded-full transition-colors duration-300"
                                                    style={{
                                                        backgroundColor: i <= strength ? colors[strength] : "#e2e8f0"
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs font-medium text-right" style={{ color: colors[strength] }}>
                                            {strengthText[strength]}
                                        </p>
                                    </div>
                                )}
                                <div className="h-5 text-sm text-red-500">
                                    {errors.password && touched.password && (
                                        <p className="animate-in fade-in-0 slide-in-from-top-1 duration-300">
                                            {errors.password[0]}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="confirm-password">Confirm New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="confirm-password"
                                        name="confirmPassword"
                                        placeholder="Repeat new password"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => { setConfirmPassword(e.target.value); setTouched((prev) => ({ ...prev, confirmPassword: true })); }}
                                        onBlur={() => handleBlur("confirmPassword")}
                                        className="pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <div className="h-5 text-sm text-red-500">
                                    {errors.confirmPassword && touched.confirmPassword && (
                                        <p className="animate-in fade-in-0 slide-in-from-top-1 duration-300">
                                            {errors.confirmPassword[0]}
                                        </p>
                                    )}
                                </div>
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
                                {loading ? "Updating..." : "Update Password"}
                            </Button>
                        </form>

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