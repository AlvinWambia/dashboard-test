"use client";


import "@/app/globals.css";
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator"
import { ArrowUpRight, Heart, Activity, MousePointer2, Plus, AlertCircleIcon, Plane, Tag, MessageSquare, Star } from "lucide-react";
import Image from 'next/image';
import daImage from "@/components/images/da.png"
import communicationImage from "@/components/images/communication.png"
import dmbImage from "@/components/images/dmb.png"
import trcImage from "@/components/images/trc.png"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import Link from "next/link"
import { urlFor } from "@/lib/sanity";


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,

} from "@/components/ui/carousel"

import { Badge } from "@/components/ui/badge"






function FadeInSection({ children }) {
    const [isVisible, setIsVisible] = React.useState(false)
    const domRef = React.useRef()

    React.useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                setIsVisible(entry.isIntersecting)
            })
        })
        const { current } = domRef
        if (current) observer.observe(current)
        return () => observer.disconnect()
    }, [])

    return (
        <div
            ref={domRef}
            className={`transition-all duration-1000 ease-out transform ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
                }`}
        >

            {children}
        </div>
    )
}




export default function HomeClient({ products, programs, testimonials, about }) {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')

    const [activeTab, setActiveTab] = React.useState(about?.[0]?.name)
    const [api, setApi] = React.useState()
    const [current, setCurrent] = React.useState(0)
    const [count, setCount] = React.useState(0)

    React.useEffect(() => {
        if (!api) {
            return
        }

        setCount(api.scrollSnapList().length)
        setCurrent(api.selectedScrollSnap() + 1)

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1)
        })
    }, [api])


    return (
        <div className="min-h-screen bg-white p-4 md:p-8 text-slate-900">
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

            <FadeInSection>
                <nav className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-2 font-bold text-xl">
                        ⠿myFit
                    </div>

                    <div className="hidden md:flex bg-slate-100 rounded-full p-1 px-2 gap-1 mx-auto">
                        {['Home', 'Testimonials', 'About', 'Programs', 'Contacts'].map((item) => (
                            <Button key={item} variant="ghost" className="rounded-full px-6 hover:bg-white hover:shadow-sm">
                                {item}
                            </Button>
                        ))}
                    </div>

                    <Link href="/auth/login">
                        <Button className="bg-black hover:bg-white hover:text-black text-white hover:border-black border-2 rounded-full px-6 py-4 text-sm">
                            Join Now!
                        </Button>
                    </Link>
                </nav>
            </FadeInSection>

            {/* --- Main Content Grid --- */}
            <FadeInSection>
                <div className="grid grid-cols-12 gap-6 max-w-7xl mx-auto my-5">

                    {/* Left Column: Headline & Small Cards */}
                    <div className="col-span-12 lg:col-span-6 space-y-8">
                        <h1 className="text-6xl md:text-5xl font-semibold leading-[1.1] tracking-tight">
                            Join the Fitness Revolution, Your Body, Your Rules!
                        </h1>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Card className="bg-blue-100 border-none p-6 rounded-[2rem] relative flex flex-col justify-between aspect-square">
                                <Button size="icon" variant="secondary" className="absolute top-4 right-4 rounded-full w-8 h-8">
                                    <ArrowUpRight className="w-4 h-4" />
                                </Button>
                                <p className="font-medium text-lg mt-auto">Workout Program</p>
                            </Card>
                            <Card className="bg-slate-100 border-none p-6 rounded-[2rem] relative flex flex-col justify-between aspect-square">
                                <Button size="icon" variant="secondary" className="absolute top-4 right-4 rounded-full w-8 h-8">
                                    <ArrowUpRight className="w-4 h-4" />
                                </Button>
                                <p className="font-medium text-lg mt-auto">Wellness</p>
                            </Card>
                            <Card className="bg-blue-200 border-none p-6 rounded-[2rem] relative flex flex-col justify-between aspect-square">
                                <Button size="icon" variant="secondary" className="absolute top-4 right-4 rounded-full w-8 h-8">
                                    <ArrowUpRight className="w-4 h-4" />
                                </Button>
                                <p className="font-medium text-lg mt-auto">Nutrition</p>
                            </Card>
                        </div>

                        {/* Bottom Left: Stretching Image Card */}
                        <div className="relative rounded-[3rem] overflow-hidden h-[300px] bg-gray-200">
                            <img
                                src="/api/source/40"
                                alt=""
                                className="object-cover w-full h-full"
                            />
                            {/* Heart Rate Overlay */}
                            <div className="absolute top-6 left-6 bg-white/80 backdrop-blur-md p-2 rounded-2xl w-32 ">
                                <p className="text-sm text-black mx-auto pl-2">Train With Me</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Hero Image & Stats */}
                    <div className="col-span-12 lg:col-span-6 relative">
                        <div className="bg-gray-200 rounded-[4rem] h-full relative overflow-hidden flex flex-col items-center pt-20">
                            {/* Floating Tags */}


                            {/* Central Jump Image Placeholder */}
                            <div className="relative z-10 mt-10">
                                <img src={trcImage.src} alt="Athlete Jumping" className="h-full object-contain transition-transform duration-500 hover:-translate-y-4" />

                                {/* Feature Callouts */}

                            </div>

                            {/* Bottom Right White Card */}
                            <div className="absolute bottom-6 right-6 bg-white p-3 rounded-[3rem] w-45 shadow-sm z-20 border border-white/20 my-5 mx-5">
                                <p className="text-black text-sm mx-auto my-auto pl-2">MyFit Training Program</p>
                            </div>
                        </div>

                        {/* Scroll Down Indicator */}

                    </div>

                </div>
            </FadeInSection>


            <FadeInSection>
                <section className="py-24">
                    <div className="max-w-6xl mx-auto px-4 md:px-6 text-center">
                        <Badge variant="outline" className="rounded-full px-4 py-1 mb-6 bg-white border-slate-200">
                            <MessageSquare className="w-3 h-3 mr-2" /> Testimonials
                        </Badge>
                        <h2 className="text-5xl font-bold tracking-tight mb-6">What Our Clients Are Saying</h2>
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto mb-16">
                            We take pride in delivering exceptional solutions that deliver great results. But don't just take our word for it.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {testimonials?.map((testimonials, i) => (
                                <Card key={i} className="border-none shadow-sm rounded-2xl p-6 text-left flex flex-col justify-between">
                                    <p className="text-slate-700 leading-relaxed mb-8 italic">"{testimonials.desc}"</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden" />
                                        <div>
                                            <p className="font-bold text-sm">{testimonials.name}</p>
                                            <p className="text-xs text-slate-500">{testimonials.role}</p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                        <Button variant="outline" className="mt-12 rounded-full px-8 py-6">See all Reviews &gt;</Button>
                    </div>
                </section>
            </FadeInSection>



            <FadeInSection>
                <div className="text-center">
                    <Badge variant="outline" className="rounded-full px-4 py-1 mb-6 bg-white border-slate-200">
                        <MessageSquare className="w-3 h-3 mr-2" /> About
                    </Badge>
                    <p className="text-5xl font-bold tracking-tight mb-6 text-center items-center justify-center pt-2">About MyFit</p>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto mb-16 text-center">
                        We take pride in delivering exceptional solutions that deliver great results. But don't just take our word for it.
                    </p>
                </div>
                <div className="flex flex-col lg:flex-row my-10 mx-4 lg:mx-20 gap-10 lg:gap-20 items-center">
                    <div className="w-full lg:w-auto">
                        <Tabs defaultValue="myfit" className="w-full lg:w-140">
                            <TabsList variant="line">
                                <TabsTrigger value="myfit">MyFit</TabsTrigger>
                                <TabsTrigger value="pelesia">Pelesia </TabsTrigger>
                            </TabsList>
                            <TabsContent value="myfit" className="text-lg">A little bit about the company. Learning about the coming up of my fit and everything else about it.</TabsContent>
                            <TabsContent value="pelesia" className="text-lg">A little bit about the trainer, instructor and the dietor. How she does her things and many more.</TabsContent>
                        </Tabs>
                    </div>

                    <div className="mx-0 lg:mx-20 my-5 bg-gray-100 w-full max-w-[500px] aspect-square relative overflow-hidden rounded-3xl">

                    </div>

                </div>
            </FadeInSection>



            <FadeInSection className="my-10">
                <div className="text-center">


                    <Badge variant="outline" className="rounded-full px-4 py-1 mb-6 bg-white border-slate-200">
                        <MessageSquare className="w-3 h-3 mr-2" /> Programs
                    </Badge>
                    <p className="text-5xl font-bold tracking-tight mb-6 text-center items-center justify-center pt-2">Programs</p>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto mb-16 text-center">
                        We take pride in delivering exceptional solutions that deliver great results. But don't just take our word for it.
                    </p>
                </div>

                {programs?.map((program, index) => {
                    const isEven = index % 2 === 0;
                    return (
                        <div key={program._id} className={`flex flex-col md:flex-row${!isEven ? '-reverse' : ''} my-10 mx-4 md:mx-20 gap-10 items-start`}>
                            <div className="flex flex-col py-5 flex-1">
                                <p className="text-lg font-semibold">{program.title}</p>
                                <p>{program.description}</p>
                                <Card className="w-full max-w-sm my-5">
                                    <CardHeader>
                                        <CardTitle>FAQ</CardTitle>
                                        <CardDescription>
                                            Common questions about this program.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Accordion type="single" collapsible>
                                            {program.faqs?.map((faq, i) => (
                                                <AccordionItem key={i} value={`item-${i}`}>
                                                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                                                    <AccordionContent className="text-left">{faq.answer}</AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="mx-10 my-5 bg-gray-100 flex-1 h-96 relative overflow-hidden rounded-xl">
                                {program.image && (
                                    <img
                                        src={urlFor(program.image).url()}
                                        alt={program.title}
                                        className="object-cover w-full h-full"
                                    />
                                )}
                            </div>
                        </div>
                    );
                })}

            </FadeInSection>

            <FadeInSection>
                <section className="py-20 px-6 max-w-7xl mx-auto">
                    <div className="text-center">
                        <Badge variant="outline" className="rounded-full px-4 py-1 mb-6 bg-white border-slate-200">
                            <MessageSquare className="w-3 h-3 mr-2" /> Products
                        </Badge>
                        <p className="text-5xl font-bold tracking-tight mb-6 text-center items-center justify-center pt-2">Products</p>
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto mb-16 text-center">
                            We take pride in delivering exceptional solutions that deliver great results. But don't just take our word for it.
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-8 mx-auto">
                        {products?.map((product) => (
                            <div key={product._id} className="group w-full sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)]">
                                <Card className="bg-slate-50 border-none rounded-3xl overflow-hidden relative mb-4 aspect-square flex items-center justify-center p-8">
                                    <Button size="icon" variant="ghost" className="absolute top-4 right-4 bg-white rounded-full  opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Heart className="w-4 h-4 text-white" />
                                    </Button>
                                    {product.image && (
                                        <img
                                            src={urlFor(product.image).width(300).height(300).url()}
                                            alt={product.name}
                                            className="object-contain w-full h-full mix-blend-multiply"
                                        />
                                    )}
                                </Card>
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-sm uppercase">{product.name}</h3>
                                    <span className="font-bold text-xs">${product.price?.toFixed(2)}</span>
                                </div>
                                <p className="text-slate-500 text-sm mb-3">{product.desc}</p>
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(product.rating || 5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-green-500 text-green-500" />
                                    ))}
                                    <span className="text-xs text-slate-400 font-medium ml-1">({product.reviews})</span>
                                </div>
                                <Button variant="outline" className="rounded-full border-slate-900 px-6 font-bold hover:bg-slate-900 hover:text-white transition-all">
                                    Add to Cart
                                </Button>
                            </div>
                        ))}
                    </div>
                </section>
            </FadeInSection>


            <FadeInSection>
                <div className="text-center">
                    <Badge variant="outline" className="rounded-full px-4 py-1 mb-6 bg-white border-slate-200 text-center items-center justify-center mx-auto">
                        <MessageSquare className="w-3 h-3 mr-2" /> Contacts
                    </Badge>
                    <p className="text-5xl font-bold tracking-tight mb-6 text-center items-center justify-center pt-2">Contacts</p>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto mb-16 text-center">
                        We take pride in delivering exceptional solutions that deliver great results. But don't just take our word for it.
                    </p>
                </div>
                <div className="flex flex-col lg:flex-row mx-4 lg:mx-20 my-10 gap-10">
                    <div className="py-5 w-full lg:w-auto">
                        <p className="text-3xl font-bold">Get in touch with Me</p>
                        <p className="text-sm w-full lg:w-150">Reach out to us and I'll answer any of your questions.Or fill in the newsletter form for direct access and new information regularly about the site.</p>
                        <div className="">
                            <p className="  pt-8 pb-3 text-sm font-bold">Newsletter</p>
                            <p className="text-xs w-full lg:w-100 pb-4">Receive product updates news, exclusive discounts and early access.</p>
                            <div className="">
                                <Field orientation="horizontal" className="text-xs">
                                    <Input type="search" placeholder="Enter email..." className="rounded-2xl text-xs w-full sm:w-80" />
                                    <Button className="rounded-2xl text-xs">Send</Button>
                                </Field>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 lg:gap-x-42 gap-y-10 lg:gap-y-40 max-w-4xl mx-auto py-5 w-full">
                        <div>
                            <p className="text-xs">general inquiries</p>
                            <p className="text-sm font-bold">myfit@gmail.com</p>
                        </div>

                        <div>
                            <p className="text-xs">instagram</p>
                            <p className="text-sm font-bold">myfit_training</p>
                        </div>

                        <div>
                            <p className="text-xs">facebook</p>
                            <p className="text-sm font-bold">myfit_training</p>
                        </div>

                        <div>
                            <p className="text-xs">x</p>
                            <p className="text-sm font-bold">myfit_training</p>
                        </div>

                    </div>
                </div>
            </FadeInSection>

            <div className="flex flex-col lg:flex-row px-6 lg:px-20 py-10 mx-4 lg:mx-10 mt-20 mb-10 bg-white text-xs rounded-3xl shadow-2xl">
                <div className="flex flex-col py-5 ">
                    <p className="text-sm font-bold">⠿myFit</p>
                    <p className="text-xs mt-2 text-slate-500">© copyright FitWithP 2026. All rights reserved.</p>
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
                            <span className="text-xs text-muted-foreground">
                                @myfit_training
                            </span>
                        </div>
                        <Separator orientation="vertical" />
                        <div className="flex flex-col gap-1">
                            <span className="font-medium">Facebook</span>
                            <span className="text-xs text-muted-foreground">
                                @myfit_training
                            </span>
                        </div>
                        <Separator orientation="vertical" className="hidden md:block" />
                        <div className="hidden flex-col gap-1 md:flex">
                            <span className="font-medium">Tiktok</span>
                            <span className="text-xs text-muted-foreground">@myfit_training</span>
                        </div>
                    </div>
                </div>


                <div className="ml-0 lg:ml-15 mt-10 lg:mt-0">
                    <p className="px-0 lg:px-20 pt-8 pb-3 text-xs font-bold">Newsletter</p>
                    <p className="text-xs px-0 lg:px-20 w-full lg:w-100 pb-4">Receive product updates news, exclusive discounts and early access.</p>
                    <div className="px-0 lg:px-20">
                        <Field orientation="horizontal" className="text-xs">
                            <Input type="search" placeholder="Enter email..." className="rounded-2xl text-xs" />
                            <Button className="rounded-2xl text-xs">Send</Button>
                        </Field>
                    </div>
                </div>


            </div>





        </div>
    );
}