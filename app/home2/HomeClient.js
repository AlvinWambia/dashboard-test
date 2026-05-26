"use client";


import "@/app/globals.css";
import React from 'react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";


import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator"
import { ArrowUpRight, Heart, Activity, MousePointer2, Plus, AlertCircleIcon, Plane, Tag, MessageSquare, Star } from "lucide-react";
import Image from 'next/image';
import daImage from "@/components/images/da.png"
import workout from "@/components/images/workout.jpeg"
import nutrition from "@/components/images/nutrition.jpeg"
import wellness from "@/components/images/wellness.jpeg"
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
import { BuyNowButton } from "@/components/BuyNowButton";
import { createClient } from "@/supabase/client";

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


function ImageScrollyStep({ image, title, description, badge, onInView }) {


    const ref = React.useRef(null)

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    onInView()
                }
            },
            { threshold: 0.6 }
        )

        const currentRef = ref.current
        if (currentRef) observer.observe(currentRef)

        return () => {
            if (currentRef) observer.unobserve(currentRef)
        }
    }, [onInView])

    return (
        <div ref={ref} className="min-h-[70vh] lg:h-[80vh] w-full flex items-center justify-center p-4">
            <div className="relative w-full h-full rounded-3xl overflow-hidden  transform transition-transform hover:scale-[1.01] duration-500">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover"
                />

                {/* Mobile/Tablet Text Overlay (Visible below 'lg' breakpoint) */}
                <div className="lg:hidden absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-12">
                    <Badge variant="outline" className="w-fit rounded-full px-4 py-1 mb-4 text-white border-white/20 bg-white/10 backdrop-blur-md">
                        {badge}
                    </Badge>
                    <h3 className="text-white text-3xl md:text-5xl font-bold mb-4 tracking-tight">
                        {title}
                    </h3>
                    <p className="text-white/80 text-lg md:text-xl max-w-xl leading-relaxed">
                        {description}
                    </p>
                </div>

                {/* Subtle desktop-only gradient */}
                <div className="hidden lg:block absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
        </div>
    )
}







export default function HomeClient({ products, programs, testimonials, about }) {
    const [isLoading, setIsLoading] = React.useState(true);

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
    const [userProfile, setUserProfile] = React.useState(null);

    const aboutSteps = [
        {
            title: "The Vision Behind MyFit",
            description: "Started with a simple goal: making elite fitness coaching accessible to everyone. Using a community driven path , We don't just provide workouts; we provide a system of support that empowers you to take control of your health and well-being every single day.",
            badge: "Our Story",
            image: groupTraining.src,
        },
        {
            title: "Pelesia - Lead Instructor",
            description: "A little bit about the trainer, instructor and the dietor. How she does her things and many more. Expertise in nutrition and physical training for holistic wellness.",
            badge: "Expertise",
            image: personal2.src,
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
        const fetchUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', user.id)
                    .single();
                setUserProfile(profile);
            }
        };
        fetchUser();
    }, []);

    React.useEffect(() => {
        if (signedIn) {
            const showWelcomeToast = async () => {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                let welcomeMessage = "Welcome back!";
                if (user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('full_name')
                        .eq('id', user.id)
                        .single();

                    if (profile?.full_name) {
                        welcomeMessage = `Welcome back, ${profile.full_name.split(' ')[0]}!`;
                        setUserProfile(profile);
                    }
                }

                toast.success(welcomeMessage, { description: "You have successfully signed in." });
                router.replace('/', { scroll: false });
            };
            showWelcomeToast();
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
                    <nav className="flex items-center justify-between mb-12 sticky top-0 z-50 bg-white/80 backdrop-blur-md py-4 transition-all">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 font-bold text-xl">
                            ⠿myFit
                        </motion.div>

                        <div className="hidden md:flex bg-slate-100/50 rounded-full p-1 px-2 gap-1 mx-auto border border-white/20">
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

                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <Link href={userProfile ? "/" : "/auth/login"}>
                                <Button className="bg-black hover:bg-white hover:text-black text-white hover:border-black border-2 rounded-full px-6 py-4 text-sm transition-all">
                                    {userProfile?.full_name ? `Welcome ${userProfile.full_name.split(' ')[0]}` : 'Join Now!'}
                                </Button>
                            </Link>
                        </motion.div>
                    </nav>

                    {/* --- Main Content Grid --- */}
                    <section id="home" className="grid grid-cols-12 gap-6 max-w-7xl mx-auto my-5">
                        {/* Left Column: Headline & Small Cards */}
                        <div className="col-span-12 lg:col-span-6 space-y-8">
                            <ScrollReveal>
                                <h1 className="text-6xl md:text-5xl font-semibold leading-[1.1] tracking-tight">
                                    Join the Fitness Revolution, Your Body, Your Rules!
                                </h1>
                            </ScrollReveal>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {[
                                    { title: "💪Workout Program", bg: workout, delay: 0.1, description: "Personal Training" },
                                    { title: "🧘Wellness", bg: wellness, delay: 0.2, description: "Personal Therapy" },
                                    { title: "🥗Nutrition", bg: nutrition, delay: 0.3, description: "Curated Diet" }
                                ].map((card, i) => (
                                    <ScrollReveal key={i} delay={card.delay} direction="up">
                                        <Card className="border-none p-6 rounded-[2rem] relative flex flex-col items-center justify-center text-center aspect-square group overflow-hidden">
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
                        <div className="col-span-12 lg:col-span-6 relative mt-6 lg:mt-0">
                            <div className="bg-slate-100/50 rounded-[4rem] h-full relative overflow-hidden flex items-center justify-center min-h-[400px] lg:min-h-[650px]">
                                <img
                                    src={groupTraining.src || groupTraining}
                                    alt="Athlete Jumping"
                                    className="w-full h-full object-contain relative z-20"
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





                    <section id="about" className="relative py-24">
                        <div className="max-w-7xl mx-auto px-4 md:px-6">
                            <ScrollReveal>
                                <div className="mb-20 text-center">
                                    <Badge variant="outline" className="rounded-full px-4 py-1 mb-6 bg-white border-slate-200 mx-auto">
                                        <MessageSquare className="w-3 h-3 mr-2" /> About
                                    </Badge>
                                    <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-8">About MyFit</h2>
                                    <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto">
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
                                            <h3 className="text-2xl md:text-4xl font-bold mb-8 tracking-tight">
                                                {aboutSteps[activeAboutStep].title}
                                            </h3>
                                            <p className="text-slate-600 text-sm md:text-xl max-w-md leading-relaxed">
                                                {aboutSteps[activeAboutStep].description}
                                            </p>

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
                                <div className="w-full lg:w-1/2 space-y-12 lg:space-y-40">
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
                                    <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-[3.5rem] font-medium  text-slate-300 leading-[1.1]">
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
                                return (
                                    <div key={program._id} className={`flex flex-col lg:flex-row my-24 items-start gap-16`}>
                                        <div className="flex-1 space-y-8">
                                            <ScrollReveal direction="right">
                                                <p className="text-xl font-bold tracking-tight">{program.title}</p>
                                                <p className="text-slate-600 text-sm leading-relaxed">{program.description}</p>

                                                <Card className="border-none rounded-[1.5rem] bg-white overflow-hidden mt-8">

                                                    <CardContent className="p-6 pt-1">
                                                        <Accordion type="single" collapsible>
                                                            {program.faqs?.map((faq, i) => (
                                                                <AccordionItem key={i} value={`item-${i}`} className="border-none">
                                                                    <AccordionTrigger className="text-left font-medium hover:text-black">
                                                                        {faq.question}
                                                                    </AccordionTrigger>
                                                                    <AccordionContent className="text-slate-500">
                                                                        {faq.answer}
                                                                    </AccordionContent>
                                                                </AccordionItem>
                                                            ))}
                                                        </Accordion>
                                                    </CardContent>
                                                </Card>
                                            </ScrollReveal>
                                        </div>

                                        <div className="flex-1 w-full">
                                            <ScrollReveal direction="left">
                                                <div className="relative aspect-video lg:aspect-square rounded-[3rem] overflow-hidden group">
                                                    {program.image && (
                                                        <ParallaxImage
                                                            src={urlFor(program.image).url()}
                                                            alt={program.title}
                                                            className="w-full h-full"
                                                            speed={0.2}
                                                        />
                                                    )}
                                                    <div className="absolute  transition-colors group-hover:bg-transparent" />
                                                </div>
                                            </ScrollReveal>
                                        </div>


                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section id="products" className="py-24">
                        <div className="max-w-7xl mx-auto px-4 md:px-6">
                            <ScrollReveal>
                                <div className="text-center mb-20">
                                    <Badge variant="outline" className="rounded-full px-4 py-1 mb-6 bg-white border-slate-200">
                                        <Tag className="w-3 h-3 mr-2" /> Store
                                    </Badge>
                                    <p className="text-5xl font-bold tracking-tight mb-6">Our Premium Products</p>
                                    <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                                        Gear and supplements curated to support your fitness journey and maximize performance.
                                    </p>
                                </div>
                            </ScrollReveal>


                            <p className="text-lg font-bold ml-10  mb-5">Training programs</p>
                            <div className="flex flex-wrap justify-center gap-8">
                                {products?.map((product, i) => (
                                    <ScrollReveal key={product._id} delay={i * 0.1} direction="up">

                                        <div className="group w-full max-w-[300px]">

                                            <Card className="bg-slate-50 border-none rounded-[2.5rem] overflow-hidden relative mb-4 aspect-square flex items-center justify-center p-8 transition-all hover:bg-slate-100 hover:shadow-2xl">
                                                <motion.div whileHover={{ scale: 1.1 }} className="absolute top-4 right-4 z-10">
                                                    <Button size="icon" variant="ghost" className="bg-white/80 backdrop-blur-md rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all">
                                                        <Heart className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
                                                    </Button>
                                                </motion.div>
                                                {product.image && (
                                                    <motion.img
                                                        src={urlFor(product.image).width(400).height(400).url()}
                                                        alt={product.name}
                                                        whileHover={{ scale: 1.05, rotate: 2 }}
                                                        className="object-contain w-full h-full mix-blend-multiply"
                                                    />
                                                )}
                                            </Card>
                                            <div className="px-2">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-bold text-sm uppercase tracking-wider">{product.name}</h3>
                                                    <span className="font-bold text-sm">Kshs {product.price?.toLocaleString()}</span>
                                                </div>
                                                <p className="text-slate-500 text-sm mb-3 line-clamp-2">{product.desc}</p>
                                                <div className="flex items-center gap-1 mb-5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-3.5 h-3.5 ${i < (product.rating || 5) ? "fill-black text-black" : "text-slate-200"}`} />
                                                    ))}
                                                    <span className="text-xs text-slate-400 font-medium ml-1">({product.reviews || 0})</span>
                                                </div>
                                                <BuyNowButton product={product} />
                                            </div>
                                        </div>
                                    </ScrollReveal>
                                ))}
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
                                                { label: "General Inquiries", value: "myfit@gmail.com", type: "email" },
                                                { label: "Instagram", value: "@myfit_training", link: "https://www.instagram.com/myfit_training" },
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


                        <div className="flex flex-col gap-10 my-5 ml-0 lg:ml-15">


                            <div className="flex items-center gap-2 text-sm md:gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="font-medium">Testimonials</span>
                                    <span className="text-xs text-muted-foreground">
                                        We take pride in delivering.
                                    </span>
                                </div>
                                <Separator orientation="vertical" />
                                <div className="flex flex-col gap-1">
                                    <span className="font-medium">About</span>
                                    <span className="text-xs text-muted-foreground">
                                        We take pride in delivering.
                                    </span>
                                </div>
                                <Separator orientation="vertical" className="hidden md:block" />
                                <div className="hidden flex-col gap-1 md:flex">
                                    <span className="font-medium">Programs</span>
                                    <span className="text-xs text-muted-foreground">We take pride.</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm md:gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="font-medium">Instagram</span>
                                    <Link href="https://www.instagram.com/myfit_training">
                                        <span className="text-xs text-muted-foreground">
                                            @myfit_training
                                        </span>
                                    </Link>
                                </div>
                                <Separator orientation="vertical" />
                                <div className="flex flex-col gap-1">
                                    <span className="font-medium">Facebook</span>
                                    <Link href="https://www.facebook.com/myfit_training">
                                        <span className="text-xs text-muted-foreground">
                                            @myfit_training
                                        </span>
                                    </Link>
                                </div>
                                <Separator orientation="vertical" className="hidden md:block" />
                                <div className="hidden flex-col gap-1 md:flex">
                                    <span className="font-medium">Tiktok</span>
                                    <Link href="https://www.tiktok.com/@myfit_training">
                                        <span className="text-xs text-muted-foreground">@myfit_training</span>
                                    </Link>
                                </div>
                            </div>
                        </div>


                        <div className="ml-0 lg:ml-15 mt-10 lg:mt-0">
                            <p className="px-0 lg:px-20 pt-8 pb-3 text-xs font-bold">Newsletter</p>
                            <p className="text-xs px-0 lg:px-20 w-full lg:w-100 pb-4">Receive product updates news, exclusive discounts and early access.</p>
                            <div className="px-0 lg:px-20 flex flex-col gap-2">
                                <Field orientation="horizontal" className="text-xs">
                                    <Input
                                        type="text"
                                        placeholder="Enter name..."
                                        className="rounded-2xl text-xs"
                                        value={footerName}
                                        onChange={(e) => setFooterName(e.target.value)}
                                        disabled={footerLoading}
                                    />
                                </Field>
                                <Field orientation="horizontal" className="text-xs">
                                    <Input
                                        type="email"
                                        placeholder="Enter email..."
                                        className="rounded-2xl text-xs"
                                        value={footerEmail}
                                        onChange={(e) => setFooterEmail(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleNewsletterSubmit(footerName, footerEmail, setFooterName, setFooterEmail, setFooterLoading)}
                                        disabled={footerLoading}
                                    />
                                    <Button
                                        className="rounded-2xl text-xs"
                                        onClick={() => handleNewsletterSubmit(footerName, footerEmail, setFooterName, setFooterEmail, setFooterLoading)}
                                        disabled={footerLoading}
                                    >
                                        {footerLoading ? 'Sending...' : 'Send'}
                                    </Button>
                                </Field>
                            </div>
                        </div>


                    </div>
                </motion.div>
            )
            }
        </AnimatePresence >
    )
}
