"use client";


import "@/app/globals.css";
import React from 'react';
import { Button } from "@/components/ui/button";
import { BuyNowButton } from "@/components/BuyNowButton";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { signOutAction } from "@/app/actions/auth";


import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator"
import { ArrowUpRight, Heart, Activity, MousePointer2, Plus, AlertCircleIcon, Plane, Tag, MessageSquare, Star, Menu, Loader2, Calendar, CheckCircle2 } from "lucide-react";
import Image from 'next/image';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import daImage from "@/components/images/da.png"
import pele from "@/components/images/pelebg.png"
import workout from "@/components/images/workout.jpeg"
import nutrition from "@/components/images/nutrition.jpeg"
import wellness from "@/components/images/wellness.jpeg"
import nutrition2 from "@/components/images/nutritionmyfit.png"
import loungewear from "@/components/images/loungewearmyfit.png"
import workout2 from "@/components/images/woroutmyfit.png"
import communicationImage from "@/components/images/communication.png"
import groupTraining from "@/components/images/grouptraining.jpg"
import dmbImage from "@/components/images/dmb.png"
import trcImage from "@/components/images/trc.png"
import nutritionImage from "@/components/images/nutrition1.png"
import fatImage from "@/components/images/fat1.png"
import fat2Image from "@/components/images/fat2.png"
import group from "@/components/images/group.jpg"
import train2 from "@/components/images/train2.jpg"
import personal2 from "@/components/images/personal2.jpg"
import group2 from "@/components/images/group2.jpg"
import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import Link from "next/link"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import CommentsSection from "@/components/admin/commentsSection";
import { urlFor } from "@/lib/sanity";
import dynamic from "next/dynamic";
import { createClient } from "@/supabase/client";

const BookingModal = dynamic(() => import("@/components/BookingModal"), {
    ssr: false,
});

import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,

} from "@/components/ui/carousel"

import { Badge } from "@/components/ui/badge"
import HomeSkeleton from "./HomeSkeleton";







function FadeInSection({ children }) {
    const [isVisible, setIsVisible] = React.useState(false)
    const domRef = React.useRef()

    React.useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                setIsVisible(entry.isIntersecting)
            })
        }, { threshold: 0.1 })

        const { current } = domRef
        if (current) observer.observe(current)
        return () => observer.disconnect()
    }, [])

    return (
        <motion.div
            ref={domRef}
            initial={{ opacity: 0, y: 50 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    )
}

function ParallaxImage({ src, alt, className, speed = 0.5, objectFit = "cover" }) {
    const ref = React.useRef(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    })

    // Support both string paths and Next.js image objects
    const resolvedSrc = src?.src || src

    const y = useTransform(scrollYProgress, [0, 1], [-50 * speed, 50 * speed])
    const springY = useSpring(y, { stiffness: 100, damping: 30 })

    return (
        <div ref={ref} className={`relative overflow-hidden ${className}`}>
            <motion.img
                src={resolvedSrc}
                alt={alt}
                style={{ y: springY, scale: 1.1 }}
                className={`absolute inset-0 w-full h-full ${objectFit === "cover" ? "object-cover" : "object-contain"}`}
            />
        </div>
    )
}



function ScrollReveal({ children, delay = 0, direction = "up" }) {
    const directions = {
        up: { y: 10 },
        down: { y: -10 },
        left: { x: 10 },
        right: { x: -10 }
    }

    return (
        <motion.div
            initial={{ opacity: 0, ...directions[direction] }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}

            transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
        >
            {children}
        </motion.div>
    )
}


function ImageScrollyStep({ image, title, description, badge, buttonText, link, onInView }) {
    const ref = React.useRef(null)

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    onInView()
                }
            },
            { threshold: 0.4 }
        )

        const currentRef = ref.current
        if (currentRef) observer.observe(currentRef)

        return () => {
            if (currentRef) observer.unobserve(currentRef)
        }
    }, [onInView])

    return (
        <div ref={ref} className="w-full flex flex-col justify-center p-0 lg:p-4 lg:min-h-[80vh] lg:h-[85vh]">
            <div className="bg-white rounded-3xl lg:rounded-[2rem] overflow-hidden transform transition-all duration-500 shadow-lg border border-slate-100/80 flex flex-col w-full h-full">
                {/* Image Container */}
                <div className="relative w-full h-64 sm:h-80 md:h-[420px] lg:h-full overflow-hidden flex-shrink-0">
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover object-top"
                    />
                    <div className="hidden lg:block absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                {/* Mobile & Tablet Dedicated Content Card (Visible below 'lg' breakpoint) */}
                <div className="lg:hidden p-6 sm:p-8 flex flex-col bg-white">
                    <Badge variant="outline" className="w-fit rounded-full px-3 py-1 mb-3 text-slate-700 border-slate-200 bg-slate-50">
                        {badge}
                    </Badge>
                    <h3 className="text-slate-900 text-xl sm:text-2xl font-bold mb-3 tracking-tight">
                        {title}
                    </h3>
                    <p className="text-slate-600 text-sm sm:text-base mb-6 leading-relaxed">
                        {description}
                    </p>
                    {buttonText && (
                        <Link href={link || "#"}>
                            <Button className="w-full sm:w-fit bg-black text-white hover:bg-zinc-800 rounded-full px-6 py-3 font-semibold text-sm shadow-md transition-all active:scale-95">
                                {buttonText}
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}







/**
 * @param {{ initialProfile?: any, initialUserBookings?: any[], products?: any, programs?: any, testimonials?: any, about?: any, loungewear?: any, purchasedPrograms?: any[], subscriptions?: any[] }} props
 */
export default function HomeClient({ initialProfile, initialUserBookings = [], products, programs, testimonials, about, loungewear, purchasedPrograms = [], subscriptions = [] }) {
    const [isLoading, setIsLoading] = React.useState(true);

    const isProgramOwned = (programId) => {
        const isDirectlyPurchased = purchasedPrograms?.some((p) => p.id === programId);
        const hasActiveSub = subscriptions?.some(
            (sub) => sub.program_id === programId && (sub.status === 'active' || sub.status === 'non-renewing')
        );
        return isDirectlyPurchased || hasActiveSub;
    };

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const router = useRouter();
    const searchParams = useSearchParams()
    const error = searchParams.get('error')
    const signedIn = searchParams.get('signed_in');
    const formSubmitted = searchParams.get('form_submitted');


    const [activeTab, setActiveTab] = React.useState(about?.[0]?.name)
    const [api, setApi] = React.useState()
    const [current, setCurrent] = React.useState(0)
    const [count, setCount] = React.useState(0)
    const [isCommentsOpen, setIsCommentsOpen] = React.useState(false);
    const [activeAboutStep, setActiveAboutStep] = React.useState(0);
    const [userProfile, setUserProfile] = React.useState(initialProfile || null);
    const [bookingModalProps, setBookingModalProps] = React.useState({ program: null });
    const [bookingInFlight, setBookingInFlight] = React.useState({});
    const [selectedBookingForStatus, setSelectedBookingForStatus] = React.useState(null);
    const [userBookings, setUserBookings] = React.useState(initialUserBookings);

    const fetchBookings = React.useCallback(async () => {
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { setUserBookings([]); return; }

            // Fetch by user_id OR by customer_email so that bookings created
            // before the user had an account (guest bookings) are also included.
            let query = supabase.from('bookings').select('program_id, consultation_paid, status, unlocked_purchase, created_at, id, consultation_round');

            if (user.email) {
                query = query.or(`user_id.eq.${user.id},customer_email.eq.${user.email}`);
            } else {
                query = query.eq('user_id', user.id);
            }

            const { data, error } = await query;

            if (!error && data) setUserBookings(data);
            else if (error) console.error('fetchBookings query error:', error);
        } catch (e) {
            console.error('fetchBookings error:', e);
        }
    }, []);

    const aboutSteps = [
        {
            title: "The Vision Behind MyFit",
            description: "Started with a simple goal: making elite fitness coaching accessible to all women. Using a community driven path , We don't just provide workouts; we provide a system of support that empowers you to take control of your health and well-being every single day.",
            badge: "Our Story",
            image: groupTraining.src,
            buttonText: "More About MyFit",
            link: "/about/myfit"
        },
        {
            title: "Pelesia - Lead Instructor",
            description: "Hey there, This is Pelesia Wambia. A certified fitness coach and sports and wellness enthusiasist. I focus mainly on women's strength training, body toning, nutrition goals and overall health",
            badge: "Expertise",
            image: pele.src,
            buttonText: "More About Pelesia",
            link: "/about/pelesia"
        },
    ];


    // Newsletter state (shared by contacts + footer inputs)
    const [newsletterName, setNewsletterName] = React.useState('');
    const [newsletterEmail, setNewsletterEmail] = React.useState('');
    const [footerName, setFooterName] = React.useState('');
    const [footerEmail, setFooterEmail] = React.useState('');
    const [newsletterLoading, setNewsletterLoading] = React.useState(false);
    const [footerLoading, setFooterLoading] = React.useState(false);

    const handleNewsletterSubmit = async (name, email, setName, setEmail, setLoading) => {
        if (!name || name.trim() === '') {
            toast.error('Name required', { description: 'Please enter your name.' });
            return;
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error('Invalid email', { description: 'Please enter a valid email address.' });
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Something went wrong');
            toast.success('Subscribed! 🎉', { description: 'Check your inbox for a welcome email.' });
            setName('');
            setEmail('');
        } catch (err) {
            toast.error('Failed to subscribe', { description: err.message });
        } finally {
            setLoading(false);
        }
    };

    const commentsForModal = testimonials?.map((testimonial, index) => ({
        id: `testimonial-${index}`,
        body: testimonial.desc,
        created_at: new Date().toISOString(), // Placeholder date
        author: {
            full_name: testimonial.name,
            // Using a public avatar service for variety, as none is provided.
            avatar_url: `https://avatar.iran.liara.run/public/${index + 30}`
        },
        // No author_id means edit/delete controls won't be shown for a public user
        author_id: null
    })) || [];

    React.useEffect(() => {
        if (!api) {
            return
        }

        setCount(api.scrollSnapList().length)
        setCurrent(api.selectedScrollSnap() + 1)

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1)
        })
    }, [api]);

    React.useEffect(() => {
        const supabase = createClient();

        // Fetch the current session immediately on mount
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, role')
                    .eq('id', user.id)
                    .maybeSingle();

                const fullName = profile?.full_name
                    || user.user_metadata?.full_name
                    || user.user_metadata?.name
                    || user.email?.split('@')[0]
                    || "Member";

                setUserProfile({
                    ...profile,
                    id: user.id,
                    email: user.email,
                    full_name: fullName,
                    role: profile?.role || user.user_metadata?.role || 'user'
                });
            } else {
                setUserProfile(null);
            }
        };

        fetchUser();

        // Subscribe to auth state changes so the navbar updates immediately
        // on sign-in, sign-out, and token refresh — no page reload needed.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session?.user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('full_name, role')
                        .eq('id', session.user.id)
                        .maybeSingle();

                    const fullName = profile?.full_name
                        || session.user.user_metadata?.full_name
                        || session.user.user_metadata?.name
                        || session.user.email?.split('@')[0]
                        || "Member";

                    setUserProfile({
                        ...profile,
                        id: session.user.id,
                        email: session.user.email,
                        full_name: fullName,
                        role: profile?.role || session.user.user_metadata?.role || 'user'
                    });
                } else if (event === 'SIGNED_OUT') {
                    setUserProfile(null);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    // Fetch user bookings on login, subscribe to real-time admin updates,
    // and refetch whenever the tab regains focus (reliable fallback for Realtime).
    React.useEffect(() => {
        fetchBookings();

        // Refetch when the user returns to the tab — catches admin updates
        // even if Supabase Realtime is not yet enabled on the table.
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') fetchBookings();
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Nothing to subscribe to via Realtime if the user isn't logged in
        if (!userProfile?.id) {
            return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
        }

        const supabase = createClient();

        // Listen for updates on rows matched by user_id (registered users)
        // AND rows matched by customer_email (guest / pre-login bookings).
        // We use two listeners because Supabase filter only supports one column eq per channel.
        const channelById = supabase
            .channel(`bookings-uid-${userProfile.id}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `user_id=eq.${userProfile.id}` },
                () => fetchBookings()
            )
            .subscribe();

        const channelByEmail = supabase
            .channel(`bookings-email-${userProfile.id}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `customer_email=eq.${userProfile.email}` },
                () => fetchBookings()
            )
            .subscribe();

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            supabase.removeChannel(channelById);
            supabase.removeChannel(channelByEmail);
        };
    }, [userProfile, fetchBookings]);

    React.useEffect(() => {
        if (signedIn) {
            // The onAuthStateChange listener above already sets userProfile.
            // We only need to show the toast and clean up the URL param.
            toast.success("Welcome back! 👋", { description: "You have successfully signed in." });
            router.replace('/', { scroll: false });
        } else if (formSubmitted) {
            toast.success("Form submitted", { description: "Payment Successful and your intake form has been successfully submitted." });
            router.replace('/', { scroll: false });
        }
    }, [signedIn, formSubmitted, router]);

    const handleScroll = (e, id) => {
        e.preventDefault();
        if (id === 'home') {
            window.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        } else {
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }
        }
    };

    return (
        <AnimatePresence mode="wait">
            {isLoading ? (
                <motion.div
                    key="skeleton"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <HomeSkeleton />
                </motion.div>
            ) : (
                <motion.div
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="min-h-screen bg-white p-4 md:p-8 text-slate-900 selection:bg-blue-100"
                >

                    {error === 'unauthorized' && (
                        <div className="fixed top-5 right-5 z-50 w-full max-w-md animate-in fade-in slide-in-from-top-5">
                            <Alert variant="destructive" className="bg-white shadow-lg">
                                <AlertCircleIcon className="h-4 w-4" />
                                <AlertTitle>Access Denied</AlertTitle>
                                <AlertDescription>
                                    Your account is not registered as an admin.
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}
                    {/* --- Navigation --- */}

                    {/* --- Navigation --- */}
                    <nav className="flex items-center justify-between mb-8 sm:mb-12 sticky top-0 z-50 bg-white/90 backdrop-blur-md py-3 px-2 sm:px-4  transition-all">

                        {/* Mobile Left: Menu / Profile Trigger */}
                        <div className="md:hidden flex items-center">
                            {userProfile ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-black h-9 w-9 p-0">
                                            <Menu className="w-5 h-5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => router.push('/profile')}>Profile</DropdownMenuItem>
                                        {userProfile?.role === 'admin' && (
                                            <DropdownMenuItem onClick={() => router.push('/admin/dashboard')}>
                                                Admin Dashboard
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={async () => {
                                            const supabase = createClient();
                                            supabase.auth.signOut().catch(console.error);
                                            await signOutAction();
                                            if (typeof window !== "undefined") {
                                                window.localStorage.clear();
                                                window.sessionStorage.clear();
                                            }
                                            setUserProfile(null);
                                            window.location.href = '/';
                                        }}>Log out</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : null}
                        </div>

                        {/* Brand Logo */}
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center font-bold text-lg sm:text-xl cursor-pointer md:w-1/4">
                            {userProfile ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <div className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                            ⠿myFit
                                        </div>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                        <DropdownMenuLabel>My Accounts ({userProfile.full_name || 'User'})</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => router.push('/profile')}>Profile</DropdownMenuItem>
                                        {userProfile?.role === 'admin' && (
                                            <DropdownMenuItem onClick={() => router.push('/admin/dashboard')}>
                                                Admin Dashboard
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={async () => {
                                            const supabase = createClient();
                                            supabase.auth.signOut().catch(console.error);
                                            await signOutAction();
                                            if (typeof window !== "undefined") {
                                                window.localStorage.clear();
                                                window.sessionStorage.clear();
                                            }
                                            setUserProfile(null);
                                            window.location.href = '/';
                                        }}>Log out</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                    ⠿myFit
                                </Link>
                            )}
                        </motion.div>

                        {/* Desktop Center: Main Nav Links */}
                        <div className="hidden md:flex flex-1 justify-center">
                            <div className="bg-slate-100/50 rounded-full p-1 px-2 gap-1 flex border border-white/20">
                                {['Home', 'About', 'Programs', 'Testimonials', 'Contacts'].map((item, i) => (
                                    <motion.div
                                        key={item}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <Button
                                            variant="ghost"
                                            className="rounded-full px-6 hover:bg-white hover:shadow-sm transition-all"
                                            onClick={(e) => handleScroll(e, item.toLowerCase())}
                                        >
                                            {item}
                                        </Button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Join Now / Welcome */}
                        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-end md:w-1/4">
                            <Link href={userProfile ? "/profile" : "/auth/login"}>
                                <Button className="bg-black hover:bg-white hover:text-black text-white hover:border-black border-2 rounded-full px-3 py-1.5 sm:px-6 sm:py-4 text-xs sm:text-sm font-medium transition-all whitespace-nowrap max-w-[140px] sm:max-w-none truncate">
                                    {userProfile ? `Welcome ${(userProfile.full_name || 'Member').split(' ')[0]}` : 'Join Now!'}
                                </Button>
                            </Link>
                        </motion.div>
                    </nav>

                    {/* --- Main Content Grid --- */}
                    <section id="home" className="grid grid-cols-12 gap-6 items-stretch max-w-7xl mx-auto my-5">
                        {/* Left Column: Headline & Small Cards */}
                        <div className="col-span-12 lg:col-span-6 space-y-8">
                            <ScrollReveal>
                                <h1 className="text-6xl md:text-5xl font-semibold leading-[1.1] tracking-tight">
                                    Join the Fitness Revolution, Your Body, Your Rules!
                                </h1>
                            </ScrollReveal>

                            {/* --- Primary CTA Row --- */}
                            <ScrollReveal delay={0.15}>
                                <div className="flex flex-wrap items-center gap-4">
                                    <motion.button
                                        onClick={(e) => handleScroll(e, 'programs')}
                                        whileHover={{ scale: 1.04 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="group relative flex items-center gap-2 bg-black text-white font-semibold text-sm sm:text-base px-7 py-4 rounded-full shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
                                    >
                                        {/* Animated shine sweep */}
                                        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                        <span>Shop Programs</span>
                                        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    </motion.button>

                                    <motion.button
                                        onClick={(e) => handleScroll(e, 'programs')}
                                        whileHover={{ scale: 1.04 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="flex items-center gap-2 text-slate-700 font-medium text-sm sm:text-base px-7 py-4 rounded-full border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all"
                                    >
                                        Learn More
                                    </motion.button>
                                </div>
                            </ScrollReveal>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {[
                                    { title: "💪Workout Program", bg: workout, delay: 0.1, description: "Personal Training", href: "#programs" },
                                    { title: "🧘Wellness", bg: wellness, delay: 0.2, description: "Personal Therapy", href: "/wellness" },
                                    { title: "🥗Nutrition", bg: nutrition, delay: 0.3, description: "Curated Diet", href: "/nutrition" }
                                ].map((card, i) => (
                                    <ScrollReveal key={i} delay={card.delay} direction="up">
                                        <Card
                                            onClick={() => card.href && router.push(card.href)}
                                            className="border-none p-6 rounded-[2rem] relative flex flex-col items-center justify-center text-center aspect-square group overflow-hidden cursor-pointer"
                                        >
                                            {/* Background Image */}
                                            <img
                                                src={card.bg.src || card.bg}
                                                alt={card.title}
                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            {/* Overlay for better text readability */}


                                            <motion.div
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                                className="absolute top-4 right-4 z-10"
                                            >
                                                <Button size="icon" variant="secondary" className="rounded-full w-8 h-8 bg-white/90 backdrop-blur-sm">
                                                    <ArrowUpRight className="w-4 h-4" />
                                                </Button>
                                            </motion.div>


                                        </Card>
                                    </ScrollReveal>
                                ))}
                            </div>

                            {/* Bottom Left: Stretching Image Card */}
                            <ScrollReveal delay={0.4}>
                                <div className="relative rounded-[3rem] overflow-hidden h-[300px] bg-gray-200 group">
                                    <ParallaxImage
                                        src={train2.src}
                                        alt="Training"
                                        className="w-full h-full"
                                        speed={0.2}
                                    />
                                    {/* Heart Rate Overlay */}
                                    <motion.div
                                        initial={{ x: -20, opacity: 0 }}
                                        whileInView={{ x: 0, opacity: 1 }}
                                        className="absolute top-6 left-6 bg-white/80 backdrop-blur-md p-2 rounded-2xl w-32 border border-white/20 shadow-xl"
                                    >
                                        <p className="text-sm text-black mx-auto pl-2 font-medium">Train With Me</p>
                                    </motion.div>
                                </div>
                            </ScrollReveal>



                        </div>

                        {/* Right Column: Hero Image & Stats */}
                        <div className="col-span-12 lg:col-span-6 self-stretch mt-6 lg:mt-0">
                            <div className="bg-slate-100/50 rounded-[4rem] h-full relative overflow-hidden flex items-center justify-center">
                                <img
                                    src={groupTraining.src || groupTraining}
                                    alt="Athlete Jumping"
                                    className="w-full h-full object-cover object-top relative z-20"
                                />

                                {/* Bottom Right White Card */}
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="absolute bottom-6 right-6 bg-white p-3 px-6 rounded-[3rem] shadow-xl z-30 border border-white/20 transition-all font-medium"
                                >
                                    <p className="text-black text-sm">MyFit Training Program</p>
                                </motion.div>
                            </div>
                        </div>
                    </section >





                    <section id="about" className="relative py-12 md:py-24">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6">
                            <ScrollReveal>
                                <div className="mb-10 md:mb-20 text-center">
                                    <Badge variant="outline" className="rounded-full px-4 py-1 mb-4 sm:mb-6 bg-white border-slate-200 mx-auto">
                                        <MessageSquare className="w-3 h-3 mr-2" /> About
                                    </Badge>
                                    <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 sm:mb-8">About MyFit</h2>
                                    <p className="text-slate-500 text-sm sm:text-lg md:text-xl max-w-2xl mx-auto">
                                        We take pride in delivering exceptional solutions that deliver great results. Our journey is defined by the success of our clients.
                                    </p>
                                </div>
                            </ScrollReveal>


                            <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
                                {/* Left: Sticky Text (Follower) */}
                                <div className="hidden lg:block w-1/2 sticky top-40 h-fit self-start">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeAboutStep}
                                            initial={{ opacity: 0, x: -30, filter: "blur(10px)" }}
                                            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                            exit={{ opacity: 0, x: 30, filter: "blur(10px)" }}
                                            transition={{ duration: 0.5, ease: "easeOut" }}
                                            className="py-12"
                                        >
                                            <Badge variant="outline" className="w-fit rounded-full px-4 py-1 mb-6 bg-white border-slate-200">
                                                {aboutSteps[activeAboutStep].badge}
                                            </Badge>
                                            <h3 className="text-xl md:text-4xl font-bold mb-8 tracking-tight">
                                                {aboutSteps[activeAboutStep].title}
                                            </h3>
                                            <p className="text-slate-600 text-sm md:text-lg max-w-md leading-relaxed">
                                                {aboutSteps[activeAboutStep].description}
                                            </p>

                                            {aboutSteps[activeAboutStep].buttonText && (
                                                <div className="mt-8">
                                                    <Link href={aboutSteps[activeAboutStep].link || "#"}>
                                                        <Button className="rounded-full px-6 py-4 text-sm shadow-lg hover:scale-105 transition-transform bg-black text-white hover:bg-black/90">
                                                            {aboutSteps[activeAboutStep].buttonText}
                                                        </Button>
                                                    </Link>
                                                </div>
                                            )}

                                            {/* Progress indicators */}
                                            <div className="flex gap-2 mt-12">
                                                {aboutSteps.map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`h-1 rounded-full transition-all duration-500 ${i === activeAboutStep ? "w-12 bg-black" : "w-4 bg-slate-200"
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>

                                {/* Right: Scrolling Images (Leader) */}
                                <div className="w-full lg:w-1/2 space-y-8 sm:space-y-12 lg:space-y-40">
                                    {aboutSteps.map((step, i) => (
                                        <ImageScrollyStep
                                            key={i}
                                            {...step}
                                            onInView={() => setActiveAboutStep(i)}
                                        />
                                    ))}
                                </div>

                            </div>

                        </div>

                        {/*Quote Div */}
                        <div className="relative py-32 overflow-hidden flex items-center justify-center min-h-[60vh] mt-12">
                            {/* Floating Badges */}
                            <motion.div
                                animate={{ y: [0, -15, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute top-10 left-[20%] bg-white/80 backdrop-blur-md  rounded-2xl px-4 py-2.5 flex items-center gap-2 border border-slate-100/50 z-10"
                            >
                                <span className="text-lg leading-none">🌸</span> <span className="font-semibold text-sm text-slate-800">Beautiful</span>
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, 20, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="absolute top-0 right-[25%] bg-white/80 backdrop-blur-md  rounded-2xl px-4 py-2.5 flex items-center gap-2 border border-slate-100/50 z-10"
                            >
                                <span className="text-lg leading-none">💗</span> <span className="font-semibold text-sm text-slate-800">Healthy</span>
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, -15, 0] }}
                                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                                className="absolute top-[40%] left-[5%] bg-white/80 backdrop-blur-md  rounded-2xl px-4 py-2.5 flex items-center gap-2 border border-slate-100/50 z-10"
                            >
                                <span className="text-lg leading-none">⭐</span> <span className="font-semibold text-sm text-slate-800">Confident</span>
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, 25, 0] }}
                                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                className="absolute bottom-[20%] left-[40%] bg-white/100 backdrop-blur-xl  rounded-2xl px-4 py-2.5 flex items-center gap-2 border border-slate-100/50 z-10"
                            >
                                <span className="text-lg leading-none">✨</span> <span className="font-semibold text-sm text-slate-800 ">Glowing</span>
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, -20, 0] }}
                                transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                                className="absolute bottom-[10%] right-[15%] bg-white/80 backdrop-blur-md  rounded-2xl px-4 py-2.5 flex items-center gap-2 border border-slate-100/50 z-10"
                            >
                                <span className="text-lg leading-none">😊</span> <span className="font-semibold text-sm text-slate-800">Happy</span>
                            </motion.div>

                            {/* Text */}
                            <div className="max-w-5xl mx-auto text-center px-4 relative z-0">
                                <ScrollReveal>
                                    <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-[3rem] font-medium  text-slate-300 leading-[1.1]">
                                        "MyFit helps you understand and care for your body like never before. Get insights and tips backed by expert coaching and real science <span className="text-slate-900 font-semibold">for your healthiest, happiest self."</span>
                                    </h2>
                                </ScrollReveal>
                            </div>
                        </div>
                    </section>






                    <section id="programs" className="py-24 bg-slate-50/50">
                        <div className="max-w-7xl mx-auto px-4 md:px-6">
                            <ScrollReveal>
                                <div className="text-center mb-20">
                                    <Badge variant="outline" className="rounded-full px-4 py-1 mb-6 bg-white border-slate-200">
                                        <MessageSquare className="w-3 h-3 mr-2" /> Programs
                                    </Badge>
                                    <p className="text-5xl font-bold tracking-tight mb-6">Explore Our Programs</p>
                                    <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                                        Tailored fitness journeys designed for your unique goals. From beginner to elite, we have a path for you.
                                    </p>
                                </div>
                            </ScrollReveal>

                            {programs?.map((program, index) => {
                                const product = products?.[index];
                                return (
                                    <div key={program._id} className="flex flex-col lg:flex-row my-16 items-center gap-10 lg:gap-14">
                                        {/* Text column — flex-col so price+button always sit at the bottom */}
                                        <div className="flex-1 flex flex-col gap-4 min-h-[220px]">
                                            <ScrollReveal direction="right">
                                                <p className="text-xl font-bold tracking-tight">{program.title}</p>
                                                {/* Deliverables / Service Badges */}
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {program.has_online_one_on_one && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                                            💻 Online 1-on-1
                                                        </span>
                                                    )}
                                                    {program.has_online_group && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                                                            👥 Online Group
                                                        </span>
                                                    )}
                                                    {program.has_physical_sessions && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            🏋️ Physical Sessions
                                                        </span>
                                                    )}
                                                    {program.has_digital_downloads && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                            📄 Digital Downloads
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-slate-600 text-sm leading-relaxed mt-2">{program.description}</p>
                                            </ScrollReveal>

                                            {/* Price + CTA — type aware */}
                                            <ScrollReveal direction="right">
                                                <div className="mt-auto pt-4 flex items-center gap-4 flex-wrap border-t border-slate-100">
                                                    {program.service_type === 'session' ? (
                                                        (() => {
                                                            const programId = program._id || program.id;
                                                            const latestBooking = userBookings
                                                                .filter((b) => b.program_id === programId && b.status !== 'cancelled')
                                                                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

                                                            const status = latestBooking?.status;
                                                            const unlocked = latestBooking?.unlocked_purchase;

                                                            // Derive button state from booking record
                                                            let bookingState = 'idle';
                                                            if (bookingInFlight[programId]) {
                                                                bookingState = 'booking';
                                                            } else if (isProgramOwned(programId)) {
                                                                bookingState = 'owned';
                                                            } else if (latestBooking) {
                                                                if (status === 'completed' && unlocked) bookingState = 'purchase';
                                                                else if (status === 'needs_followup') bookingState = 'followup';
                                                                else if (status === 'completed' && !unlocked) bookingState = 'awaiting_purchase';
                                                                else if (['pending', 'confirmed'].includes(status)) bookingState = 'awaiting_followup';
                                                            }

                                                            const isAwaitingAny = bookingState === 'awaiting_followup' || bookingState === 'awaiting_purchase';

                                                            return (
                                                                <>
                                                                    <div className="flex flex-col">
                                                                        {(isAwaitingAny || bookingState === 'purchase' || bookingState === 'followup') ? (
                                                                            <>
                                                                                <span className="text-xs text-slate-400 font-semibold uppercase">Program Price</span>
                                                                                <span className="text-xl font-bold text-slate-900">
                                                                                    Kshs {(program.price || product?.price || 0).toLocaleString()}
                                                                                </span>
                                                                                {bookingState === 'awaiting_followup' && (
                                                                                    <span className="text-xs text-amber-600 mt-0.5 font-medium">⏳ Awaiting admin review</span>
                                                                                )}
                                                                                {bookingState === 'awaiting_purchase' && (
                                                                                    <span className="text-xs text-blue-600 mt-0.5 font-medium">⏳ Purchase pending confirmation</span>
                                                                                )}
                                                                                {bookingState === 'followup' && (
                                                                                    <span className="text-xs text-indigo-600 mt-0.5 font-medium">🔁 Follow-up consultation required</span>
                                                                                )}
                                                                                {bookingState === 'purchase' && (
                                                                                    <span className="text-xs text-emerald-600 mt-0.5 font-medium">✓ Consultation completed</span>
                                                                                )}
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <span className="text-xs text-slate-400 font-semibold uppercase">Consultation Fee</span>
                                                                                <span className="text-xl font-bold text-slate-900">
                                                                                    Kshs {(program.consultation_fee || product?.consultation_fee || 0).toLocaleString()}
                                                                                </span>
                                                                                <span className="text-xs text-slate-500 mt-0.5">
                                                                                    Full Session: Kshs {(program.price || product?.price || 0).toLocaleString()}
                                                                                </span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                    <div className="ml-auto">
                                                                        {bookingState === 'owned' ? (
                                                                            <Link href={`/profile`}>
                                                                                <Button className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700 px-6 py-4 text-sm font-bold transition-all active:scale-95 shadow-md hover:shadow-lg">
                                                                                    Access Program
                                                                                    <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                                                                                </Button>
                                                                            </Link>
                                                                        ) : bookingState === 'purchase' ? (
                                                                            <Link href={`/programs/${programId}/onboarding`}>
                                                                                <Button className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 px-6 py-4 text-sm font-bold transition-all active:scale-95 shadow-md hover:shadow-lg">
                                                                                    Complete Purchase
                                                                                    <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                                                                                </Button>
                                                                            </Link>
                                                                        ) : bookingState === 'booking' ? (
                                                                            <Button disabled className="rounded-full bg-black/60 text-white px-6 py-4 text-sm font-bold shadow-md cursor-not-allowed">
                                                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                                Booking...
                                                                            </Button>
                                                                        ) : bookingState === 'awaiting_followup' ? (
                                                                            <Button
                                                                                disabled
                                                                                className="rounded-full bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 px-6 py-4 text-sm font-bold transition-all active:scale-95 shadow-sm"
                                                                            >
                                                                                ⏳ Awaiting Consultation
                                                                            </Button>
                                                                        ) : bookingState === 'awaiting_purchase' ? (
                                                                            <Button
                                                                                onClick={() => setSelectedBookingForStatus({ booking: latestBooking, program })}
                                                                                className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 px-6 py-4 text-sm font-bold transition-all active:scale-95 shadow-sm"
                                                                            >
                                                                                ⏳ Awaiting Purchase
                                                                            </Button>
                                                                        ) : bookingState === 'followup' ? (
                                                                            <Button
                                                                                onClick={() => {
                                                                                    setBookingInFlight(prev => ({ ...prev, [programId]: true }));
                                                                                    setBookingModalProps({ program, mode: 'followup', parentBookingId: latestBooking.id, consultationRound: (latestBooking.consultation_round || 1) + 1 });
                                                                                }}
                                                                                className="rounded-full bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-4 text-sm font-bold transition-all active:scale-95 shadow-md hover:shadow-lg"
                                                                            >
                                                                                📅 Book Follow-Up
                                                                            </Button>
                                                                        ) : (
                                                                            <Button
                                                                                onClick={() => {
                                                                                    setBookingInFlight(prev => ({ ...prev, [programId]: true }));
                                                                                    setBookingModalProps({ program, mode: 'initial' });
                                                                                }}
                                                                                className="rounded-full bg-black text-white hover:bg-zinc-800 px-6 py-4 text-sm font-bold transition-all active:scale-95 shadow-md hover:shadow-lg"
                                                                            >
                                                                                Book Consultation
                                                                                <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                </>
                                                            );
                                                        })()
                                                    ) : (<>
                                                        {(program.price > 0 || product?.price > 0) && (
                                                            <div className="flex flex-col">
                                                                <span className="text-xs text-slate-400 font-semibold uppercase">Program Price</span>
                                                                <span className="text-xl font-bold text-slate-900">
                                                                    Kshs {(program.price || product?.price || 0).toLocaleString()}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {program.service_type === 'downloadable' || !program.service_type ? (
                                                            <div className="ml-auto min-w-[140px]">
                                                                <BuyNowButton product={program} />
                                                            </div>
                                                        ) : (
                                                            <Link href={`/programs/${program._id || program.id}/onboarding`} className="ml-auto">
                                                                <Button className="rounded-full bg-black text-white hover:bg-zinc-800 px-6 py-4 text-sm font-bold transition-all active:scale-95 shadow-md hover:shadow-lg">
                                                                    Buy Program
                                                                    <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                                                                </Button>
                                                            </Link>
                                                        )}
                                                    </>
                                                    )}
                                                </div>
                                            </ScrollReveal>
                                        </div>

                                        {/* Smaller image column */}
                                        <div className="w-full lg:w-[42%] flex-shrink-0">
                                            <ScrollReveal direction="left">
                                                <div className="relative h-64 lg:h-72 rounded-[2rem] overflow-hidden group">
                                                    {program.image && (
                                                        <ParallaxImage
                                                            src={typeof program.image === 'string' ? program.image : urlFor(program.image).url()}
                                                            alt={program.title || program.name || 'Program Image'}
                                                            className="w-full h-full"
                                                            speed={0.2}
                                                        />
                                                    )}
                                                    <div className="absolute inset-0 transition-colors group-hover:bg-transparent" />
                                                </div>
                                            </ScrollReveal>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section id="faq" className="py-24 bg-slate-50/50">
                        <div className="max-w-7xl mx-auto px-4 md:px-6">
                            <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
                                <div className="lg:w-1/3">
                                    <ScrollReveal direction="right">
                                        <p className="text-blue-600 font-bold text-sm tracking-wide uppercase mb-2">FAQ</p>
                                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Frequently Asked<br />Questions</h2>
                                        <p className="text-slate-500 text-lg">
                                            We compiled a list of answers to address your most pressing questions regarding our Services.
                                        </p>
                                    </ScrollReveal>
                                </div>

                                <div className="lg:w-2/3">
                                    <ScrollReveal direction="left">
                                        <Accordion type="single" collapsible className="w-full space-y-4">
                                            <AccordionItem value="item-1" className="border border-slate-200 rounded-xl px-6 bg-slate-50/50 shadow-sm overflow-hidden">
                                                <AccordionTrigger className="text-left font-semibold py-4 hover:no-underline transition-colors text-black">What payment methods do you accept?</AccordionTrigger>
                                                <AccordionContent className="text-slate-500 pb-4 text-base">
                                                    We accept secure online payments through supported payment providers.
                                                </AccordionContent>
                                            </AccordionItem>
                                            <AccordionItem value="item-2" className="border border-slate-200 rounded-xl px-6 bg-slate-50/50 shadow-sm overflow-hidden">
                                                <AccordionTrigger className="text-left font-semibold py-4 hover:no-underline transition-colors text-black">Can I get a refund?</AccordionTrigger>
                                                <AccordionContent className="text-slate-500 pb-4 text-base">
                                                    Refund eligibility depends on the type of program purchased and whether services have already been delivered. Please review our refund policy before purchasing.
                                                </AccordionContent>
                                            </AccordionItem>
                                            <AccordionItem value="item-3" className="border border-slate-200 rounded-xl px-6 bg-slate-50/50 shadow-sm overflow-hidden">
                                                <AccordionTrigger className="text-left font-semibold py-4 hover:no-underline transition-colors text-black">Can I switch programs after purchasing?</AccordionTrigger>
                                                <AccordionContent className="text-slate-500 pb-4 text-base">
                                                    Program changes may be possible before services begin. Contact support for assistance.
                                                </AccordionContent>
                                            </AccordionItem>
                                            <AccordionItem value="item-4" className="border border-slate-200 rounded-xl px-6 bg-slate-50/50 shadow-sm overflow-hidden">
                                                <AccordionTrigger className="text-left font-semibold py-4 hover:no-underline transition-colors text-black">Is my personal information secure?</AccordionTrigger>
                                                <AccordionContent className="text-slate-500 pb-4 text-base">
                                                    Yes. Your information is stored securely and is only shared with your assigned trainer when necessary to provide your service.
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </ScrollReveal>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="testimonials" className="py-24">
                        <div className="max-w-6xl mx-auto px-4 md:px-6 text-center">
                            <ScrollReveal>
                                <Badge variant="outline" className="rounded-full px-4 py-1 mb-6 bg-white border-slate-200">
                                    <MessageSquare className="w-3 h-3 mr-2" /> Testimonials
                                </Badge>
                                <h2 className="text-5xl font-bold tracking-tight mb-6">What Our Clients Are Saying</h2>
                                <p className="text-slate-500 text-lg max-w-2xl mx-auto mb-16">
                                    We take pride in delivering exceptional solutions that deliver great results. But don't just take our word for it.
                                </p>
                            </ScrollReveal>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {testimonials?.map((t, i) => (
                                    <ScrollReveal key={i} delay={i * 0.1} direction="up">
                                        <Card className="border-none shadow-sm hover:shadow-xl transition-shadow duration-500 rounded-2xl p-6 text-left h-full flex flex-col justify-between bg-white group">
                                            <p className="text-slate-700 leading-relaxed mb-8 italic group-hover:text-black transition-colors">"{t.desc}"</p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden relative">
                                                    <div className="absolute inset-0 bg-slate-300 animate-pulse" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm">{t.name}</p>
                                                    <p className="text-xs text-slate-500">{t.role}</p>
                                                </div>
                                            </div>
                                        </Card>
                                    </ScrollReveal>
                                ))}
                            </div>

                            <ScrollReveal delay={0.4}>
                                <Link href="/reviews">
                                    <Button variant="outline" className="mt-12 rounded-full px-8 py-6 hover:bg-black hover:text-white transition-all">
                                        See all Reviews &gt;
                                    </Button>
                                </Link>
                            </ScrollReveal>
                        </div>
                    </section>


                    <section id="contacts" className="py-24 bg-black text-white rounded-[4rem] mx-4 md:mx-6">
                        <div className="max-w-7xl mx-auto px-6 lg:px-20">
                            <ScrollReveal>
                                <div className="text-center mb-20">
                                    <Badge variant="outline" className="rounded-full px-4 py-1 mb-6 bg-white/10 border-white/20 text-white">
                                        <MessageSquare className="w-3 h-3 mr-2" /> Get In Touch
                                    </Badge>
                                    <h2 className="text-5xl font-bold tracking-tight mb-8">Let's Talk Fitness</h2>
                                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                                        Have questions about our programs or products? Reach out and we'll help you find the perfect path.
                                    </p>
                                </div>
                            </ScrollReveal>

                            <div className="flex flex-col lg:flex-row gap-16">
                                <div className="flex-1 space-y-12">
                                    <ScrollReveal direction="right">
                                        <h3 className="text-3xl font-bold">Contact Information</h3>
                                        <p className="text-slate-400">Reach out directly or subscribe to our newsletter for exclusive updates and training tips.</p>

                                        <div className="space-y-8 mt-12">
                                            {[
                                                { label: "General Inquiries", value: "myfitrainingg@gmail.com", type: "email" },
                                                { label: "Instagram", value: "@myfit.training", link: "https://www.instagram.com/myfit.training" },
                                                { label: "Facebook", value: "MyFit Training", link: "https://www.facebook.com/myfit_training" }
                                            ].map((contact, i) => (
                                                <div key={i}>
                                                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">{contact.label}</p>
                                                    <p className="text-[11px] font-medium hover:text-blue-400 transition-colors cursor-pointer">
                                                        {contact.value}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollReveal>
                                </div>

                                <div className="flex-1">
                                    <ScrollReveal direction="left">
                                        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 backdrop-blur-xl">
                                            <h4 className="text-xl font-bold mb-2">Join Our Newsletter</h4>
                                            <p className="text-slate-400 text-sm mb-8">Get the latest workout plans and dietary tips delivered to your inbox.</p>

                                            <div className="flex flex-col gap-4">
                                                <Input
                                                    type="text"
                                                    placeholder="Enter your name"
                                                    className="rounded-2xl bg-white/10 border-white/20 text-white h-14"
                                                    value={newsletterName}
                                                    onChange={(e) => setNewsletterName(e.target.value)}
                                                />
                                                <Input
                                                    type="email"
                                                    placeholder="Enter your email"
                                                    className="rounded-2xl bg-white/10 border-white/20 text-white h-14"
                                                    value={newsletterEmail}
                                                    onChange={(e) => setNewsletterEmail(e.target.value)}
                                                />
                                                <Button
                                                    className="rounded-2xl h-14 bg-white text-black hover:bg-slate-200 transition-all font-bold"
                                                    onClick={() => handleNewsletterSubmit(newsletterName, newsletterEmail, setNewsletterName, setNewsletterEmail, setNewsletterLoading)}
                                                    disabled={newsletterLoading}
                                                >
                                                    {newsletterLoading ? 'Joining...' : 'Subscribe Now'}
                                                </Button>
                                            </div>
                                            <p className="text-[10px] text-slate-500 mt-4 text-center">
                                                Proper data protection guaranteed. Unsubscribe at any time.
                                            </p>
                                        </div>
                                    </ScrollReveal>
                                </div>
                            </div>
                        </div>
                    </section>


                    <div className="flex flex-col lg:flex-row px-6 lg:px-20 py-10 mx-4 lg:mx-10 mt-20 mb-10 bg-white text-xs rounded-3xl shadow-xl">
                        <div className="flex flex-col py-5 ">
                            <p className="text-sm font-bold">⠿myFit</p>
                            <p className="text-xs mt-2 text-slate-500">© copyright myFit 2026. All rights reserved.</p>
                            <Button className="w-50 rounded-2xl text-white bg-black border-2 border-black hover:bg-black hover:text-white mt-3">Become a member</Button>
                        </div>


                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 my-5 ml-0 lg:ml-15 w-full">
                            <div className="flex flex-col gap-3">
                                <span className="font-bold text-sm">Company</span>
                                <Link href="#" className="text-xs text-slate-500 hover:text-black transition">About Us</Link>
                                <Link href="#" className="text-xs text-slate-500 hover:text-black transition">Contact Us</Link>

                            </div>

                            <div className="flex flex-col gap-3">
                                <span className="font-bold text-sm">Programs</span>
                                <Link href="#" className="text-xs text-slate-500 hover:text-black transition">Personalized Plans</Link>
                                <Link href="#" className="text-xs text-slate-500 hover:text-black transition">Online Coaching</Link>
                                <Link href="#" className="text-xs text-slate-500 hover:text-black transition">In-Person Coaching</Link>
                            </div>

                            <div className="flex flex-col gap-3">
                                <span className="font-bold text-sm">Support</span>
                                <Link href="#" className="text-xs text-slate-500 hover:text-black transition">FAQ</Link>
                                <Link href="#" className="text-xs text-slate-500 hover:text-black transition">Help Center</Link>
                            </div>

                            <div className="flex flex-col gap-3">
                                <span className="font-bold text-sm">Legal</span>
                                <Link href="/legal/privacy-policy" className="text-xs text-slate-500 hover:text-black transition">Privacy Policy</Link>
                                <Link href="/legal/terms-of-service" className="text-xs text-slate-500 hover:text-black transition">Terms of Service</Link>
                                <Link href="/legal/refund-policy" className="text-xs text-slate-500 hover:text-black transition">Refund Policy</Link>
                                <Link href="/legal/cancellation-policy" className="text-xs text-slate-500 hover:text-black transition">Cancellation Policy</Link>
                                <Link href="/legal/health-disclaimer" className="text-xs text-slate-500 hover:text-black transition">Health Disclaimer</Link>
                                <Link href="/legal/cookie-policy" className="text-xs text-slate-500 hover:text-black transition">Cookie Policy</Link>
                            </div>
                        </div>


                    </div>

                    <BookingModal
                        isOpen={!!bookingModalProps.program}
                        onClose={() => {
                            // Capture programId BEFORE clearing modal props
                            const closingProgramId = bookingModalProps.program
                                ? (bookingModalProps.program._id || bookingModalProps.program.id)
                                : null;
                            setBookingModalProps({ program: null });
                            if (closingProgramId) {
                                setBookingInFlight(prev => ({ ...prev, [closingProgramId]: false }));
                            }
                            fetchBookings();
                        }}
                        program={bookingModalProps.program}
                        userProfile={userProfile}
                        mode={bookingModalProps.mode}
                        parentBookingId={bookingModalProps.parentBookingId}
                        consultationRound={bookingModalProps.consultationRound}
                        onBookingCreated={(newBooking) => {
                            // Capture programId BEFORE clearing modal props
                            const createdProgramId = bookingModalProps.program
                                ? (bookingModalProps.program._id || bookingModalProps.program.id)
                                : null;
                            if (createdProgramId) {
                                setBookingInFlight(prev => ({ ...prev, [createdProgramId]: false }));
                            }
                            setUserBookings(prev => {
                                const exists = prev.some(b => b.id === newBooking.id);
                                if (!exists) return [...prev, newBooking];
                                // Update existing booking in place (e.g. status change)
                                return prev.map(b => b.id === newBooking.id ? { ...b, ...newBooking } : b);
                            });
                        }}
                    />

                    <Dialog open={!!selectedBookingForStatus} onOpenChange={(open) => !open && setSelectedBookingForStatus(null)}>
                        <DialogContent className="sm:max-w-md rounded-2xl bg-white p-6">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold">Booking Status</DialogTitle>
                                <DialogDescription className="text-sm text-slate-500">
                                    Details for your consultation for {selectedBookingForStatus?.program?.title || selectedBookingForStatus?.program?.name}.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-1 text-sm">
                                    <span className="text-xs uppercase font-bold tracking-widest text-slate-400">Status</span>
                                    <span className="font-semibold capitalize text-slate-900">
                                        {selectedBookingForStatus?.booking?.status?.replace('_', ' ') || 'Unknown'}
                                    </span>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-1 text-sm">
                                    <span className="text-xs uppercase font-bold tracking-widest text-slate-400">Created On</span>
                                    <span className="font-semibold text-slate-900">
                                        {selectedBookingForStatus?.booking?.created_at ? new Date(selectedBookingForStatus.booking.created_at).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500">
                                    Our team will contact you shortly if you haven't yet received an email confirmation or link for your consultation.
                                </p>
                            </div>
                            <Button onClick={() => setSelectedBookingForStatus(null)} className="w-full rounded-xl bg-black text-white hover:bg-zinc-800">
                                Close
                            </Button>
                        </DialogContent>
                    </Dialog>
                </motion.div>
            )
            }
        </AnimatePresence >
    )
}
