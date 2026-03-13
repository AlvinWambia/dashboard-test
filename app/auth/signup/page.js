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
import { ArrowUpIcon, Eye, EyeOff } from "lucide-react"
import googleImage from "@/components/images/google1.jpg"
import { useState, useEffect } from "react";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";
import { getURL } from "@/lib/getURL";
import zxcvbn from "zxcvbn"
import { z } from "zod";

const signupSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Invalid email address." }),
    password: z.string().min(10, { message: "Password must be at least 10 characters." })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
        .regex(/[0-9]/, { message: "Password must contain at least one number." })
        .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character." }),
    confirmPassword: z.string(),
    terms: z.literal(true, { errorMap: () => ({ message: "You must accept the terms and conditions." }) }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");
    const [terms, setTerms] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const [strength, setStrength] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const colors = ["#ff4d4f", "#fa8c16", "#fadb14", "#52c41a", "#237804"];
    const router = useRouter();

    const supabase = createClient();


    useEffect(() => {
        const validationResult = signupSchema.safeParse({
            name,
            email,
            password,
            confirmPassword,
            terms
        });

        if (!validationResult.success) {
            setErrors(validationResult.error.flatten().fieldErrors);
        } else {
            setErrors({});
        }
    }, [name, email, password, confirmPassword, terms]);

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

    const handleSignUp = async (e) => {
        e.preventDefault();
        setErrors({});
        setSuccess(null);
        setLoading(true);

        setTouched({
            name: true,
            email: true,
            password: true,
            confirmPassword: true,
            terms: true
        });

        const validationResult = signupSchema.safeParse({
            name,
            email,
            password,
            confirmPassword,
            terms
        });

        if (!validationResult.success) {
            const fieldErrors = validationResult.error.flatten().fieldErrors;
            setErrors(fieldErrors);
            setLoading(false);
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                },
                emailRedirectTo: getURL('/auth/callback?next=/auth/login'),
            },
        });

        if (error) {
            console.error("Signup Error Details:", error);
            setErrors({ form: [error.message] });
        } else if (data.session) {
            setSuccess("Account created successfully! Redirecting...");

            // ✅ RIGHT: Fetch the actual role from your profiles table
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single();

            if (profile?.role === 'admin') {
                router.push("/admin/dashboard");
            } else {
                router.push("/home2");
            }
        }
        setLoading(false);
    };

    // This is a conceptual example, no need to code it yet.

    const handleGoogleSignIn = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: getURL('/auth/callback?next=/home2'),
            },
        });

        if (error) {
            // Handle the error (e.g., show a notification)
            console.error('Error signing in with Google:', error.message);
        }
    };


    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-4xl grid lg:grid-cols-2 rounded-3xl shadow-2xl bg-white overflow-hidden">
                {/* LEFT SIDE: Image & Testimonial */}
                <div className="relative hidden bg-muted lg:block">
                    <Image
                        src={daImage.src}
                        alt="Testimonial background"
                        fill
                        className="object-cover brightness-[0.7]"
                    />
                    <div className="absolute top-10 left-10 right-10 text-white">
                        <Button variant="outline">Homepage</Button>
                        <Button variant="outline" size="icon" aria-label="Submit">
                            <ArrowUpIcon />
                        </Button>
                    </div>
                    <div className="absolute bottom-10 left-10 right-10 text-white">
                        <blockquote className="space-y-2">
                            <p className="text-3xl font-medium leading-tight">
                                &ldquo;Simply the tools that my team and I need.&rdquo;
                            </p>
                            <footer className="text-sm">
                                <div className="font-semibold">Alvin Wambia</div>
                                <div className="text-white/80">Software Developer</div>
                            </footer>
                        </blockquote>
                    </div>
                </div>

                {/* RIGHT SIDE: Login Form */}
                <div className="flex flex-col items-center justify-center p-8 lg:p-12 mx-auto">
                    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">

                        {/* Logo & Header */}
                        <div className="flex flex-col space-y-2 text-center">
                            <div className="flex items-center justify-center font-bold text-2xl mb-2">
                                <span className="mr-2">⠿</span> FitWithP
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight">Welcome to FitWithP</h1>
                            <p className="text-sm text-muted-foreground">
                                Build your design system effortlessly with our powerful component library.
                            </p>
                        </div>

                        {/* Form Fields */}
                        <form onSubmit={handleSignUp} className="grid gap-2 lg:mr-5">
                            <div className="grid gap-2">
                                <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            autoComplete="name"
                                            placeholder="Jordan"
                                            value={name}
                                            onChange={(e) => { setName(e.target.value); setTouched((prev) => ({ ...prev, name: true })); }}
                                            onBlur={() => handleBlur("name")}
                                            required
                                        />
                                        <div className="h-5 text-sm text-red-500">
                                            {errors.name && touched.name && (
                                                <p className="animate-in fade-in-0 slide-in-from-top-1 duration-300">
                                                    {errors.name[0]}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            autoComplete="email"
                                            placeholder="lee@example.com"
                                            type="email"
                                            value={email}
                                            onChange={(e) => { setEmail(e.target.value); setTouched((prev) => ({ ...prev, email: true })); }}
                                            onBlur={() => handleBlur("email")}
                                            required
                                        />
                                        <div className="h-5 text-sm text-red-500">
                                            {errors.email && touched.email && (
                                                <p className="animate-in fade-in-0 slide-in-from-top-1 duration-300">
                                                    {errors.email[0]}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="password" className="">Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                name="password"
                                                placeholder="Password"
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
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="confirm-password" className="">Confirm Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="confirm-password"
                                                name="confirmPassword"
                                                placeholder="Repeat Password"
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
                                </div>
                                <div className="grid gap-2">
                                    <div className="h-5 text-sm">
                                        {errors.form && (
                                            <p className="text-red-500 animate-in fade-in-0 slide-in-from-top-1 duration-300">
                                                {errors.form[0]}
                                            </p>
                                        )}
                                        {success && (
                                            <p className="text-green-500 animate-in fade-in-0 slide-in-from-top-1 duration-300">
                                                {success}
                                            </p>
                                        )}
                                    </div>

                                </div>
                                <div className="grid gap-1">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="terms"
                                            checked={terms}
                                            onCheckedChange={(checked) => { setTerms(checked); setTouched((prev) => ({ ...prev, terms: true })); }}
                                        />
                                        <Label htmlFor="terms">Accept terms and conditions</Label>
                                    </div>
                                    <div className="h-5 pl-6 text-sm text-red-500">
                                        {errors.terms && touched.terms && <p className="animate-in fade-in-0 slide-in-from-top-1 duration-300">{errors.terms[0]}</p>}
                                    </div>
                                </div>
                            </div>


                            <Button type="submit" disabled={loading} className="w-full bg-white text-black border border-black hover:bg-black hover:text-white text-lg py-3">
                                {loading ? "Signing up..." : "Sign up"}
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="relative lg:mr-5">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">OR</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:mr-5">

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
                            Already have an account?{" "}
                            <Link href="/auth/login" className="font-semibold text-black hover:underline">
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}