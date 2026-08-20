"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, MapPin, Layers, Users, Bookmark, ClipboardList, Check } from "lucide-react";
import { createClient } from "@/supabase/client";
import { toast } from "sonner";
import { checkAvailability } from "@/app/actions/calendar";

// 1. Validation Schema
const formSchema = z.object({
    // Step 1
    fullName: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().min(10, "A valid phone number is required").optional(),
    birthDate: z.string().min(1, "Date of birth is required"),
    gender: z.string().min(1, "Gender is required"),

    // Step 2
    currentWeight: z.coerce.number().min(1, "Weight is required"),
    height: z.coerce.number().min(1, "Height is required"),
    activityLevel: z.string().min(1, "Activity level is required"),
    trainingLevel: z.string().min(1, "Training level is required"),

    // Step 3
    goal: z.string().min(1, "A goal is required"),
    targetWeight: z.coerce.number().optional(),
    goalDescription: z.string().optional(),

    // Step 4
    injuries: z.string().optional(),
    medicalConditions: z.string().optional(),

    // Step 5
    meetingDate: z.string().optional(),
    meetingTime: z.string().optional(),
});

const calculateAge = (birthDateString) => {
    if (!birthDateString) return 0;
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

function IntakeForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 5;
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Start as false so the form renders immediately; we'll pre-fill in the background
    const [isLoading, setIsLoading] = useState(false);

    const methods = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            email: "",
            phoneNumber: "",
            birthDate: "",
            gender: "Male",
            currentWeight: "",
            height: "",
            activityLevel: "sedentary",
            trainingLevel: "beginner",
            goal: "",
            targetWeight: "",
            goalDescription: "",
            injuries: "",
            medicalConditions: "",
        },
    });

    useEffect(() => {
        const checkUser = async () => {
            // Create client inside the effect to avoid stale closures
            const supabase = createClient();
            try {
                const { data: { user }, error: userError } = await supabase.auth.getUser();

                if (userError || !user) {
                    router.push('/auth/login');
                    return;
                }

                // Use maybeSingle() to safely handle new users with no profile row
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, email')
                    .eq('id', user.id)
                    .maybeSingle();

                // CHECK: If user already has an intake form, skip form and go to checkout
                const { data: existingForm } = await supabase
                    .from('client_intake_forms')
                    .select('id')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (existingForm) {
                    if (orderId) {
                        router.push(`/checkout/${orderId}`);
                    } else {
                        router.push('/?signed_in=true');
                    }
                    return;
                }

                // Pre-fill name/email from profile or auth metadata
                methods.setValue('fullName', profile?.full_name || user.user_metadata?.full_name || '');
                methods.setValue('email', user.email || '');
            } catch (error) {
                console.error("Error checking user:", error);
            }
        };

        checkUser();
    }, [orderId, router]);

    const progressComments = [
        "Let's start with your personal details.",
        "Great! Now tell us about your body and activity level.",
        "What are your fitness goals?",
        "Any medical conditions we should be aware of?",
        "Almost there! Please review your information.",
    ];

    // Handle step transitions with validation
    const handleNext = async () => {
        // On step 5 (review), validate all fields. Otherwise, just the current step's fields.
        const fieldsToValidate = currentStep === 5 ? undefined : getFieldsByStep(currentStep);
        const isValid = await methods.trigger(fieldsToValidate);

        if (isValid) {
            if (currentStep === 1) {
                const birthDateStr = methods.getValues("birthDate");
                const age = calculateAge(birthDateStr);
                if (age < 18) {
                    toast.error("Age Restriction", { description: "You must be at least 18 years old to fill this form." });
                    return;
                }
            }

            if (currentStep === 5) {
                setIsSubmitting(true);
                try {
                    const formData = methods.getValues();

                    // Verify the user is still authenticated before submitting
                    const supabase = createClient();
                    const { data: { user }, error: authError } = await supabase.auth.getUser();

                    if (authError || !user) {
                        throw new Error("Your session has expired. Please refresh the page and log in again.");
                    }

                    const { error } = await supabase.from('client_intake_forms').insert({
                        user_id: user.id,
                        order_id: orderId || null,
                        full_name: formData.fullName,
                        email: formData.email,
                        phone_number: formData.phoneNumber,
                        birth_date: formData.birthDate,
                        gender: formData.gender,
                        current_weight: formData.currentWeight,
                        height: formData.height,
                        training_level: formData.trainingLevel,
                        activity_level: formData.activityLevel,
                        goal: formData.goal,
                        target_weight: formData.goal === 'lose-weight' ? (formData.targetWeight || null) : null,
                        goal_description: formData.goalDescription,
                        injuries: formData.injuries,
                        medical_conditions: formData.medicalConditions,
                    });

                    if (error) {
                        // Log the full Supabase error so it is visible in DevTools Console
                        console.error("Supabase insert error:", {
                            message: error.message,
                            details: error.details,
                            hint: error.hint,
                            code: error.code,
                        });
                        throw error;
                    }

                    toast.success("Intake Form Submitted", {
                        description: "Your registration details have been saved."
                    });

                    // Do NOT reset isSubmitting here — keep the button disabled
                    // during navigation so the user cannot double-submit.
                    if (orderId) {
                        window.location.href = `/checkout/${orderId}`;
                    } else {
                        window.location.href = '/?form_submitted=true';
                    }
                } catch (error) {
                    // Surface the real error message safely
                    console.error("Form submission failed:", error);
                    let description = "There was an error submitting your form. Please try again.";
                    if (error) {
                        if (typeof error.message === 'string') description = error.message;
                        else if (typeof error.details === 'string') description = error.details;
                        else if (typeof error === 'string') description = error;
                    }
                    try {
                        toast.error("Submission Failed", { description });
                    } catch (toastErr) {
                        console.error("Failed to show toast:", toastErr);
                    }
                } finally {
                    // ALWAYS reset button state so it doesn't get stuck if navigation or anything else fails
                    setIsSubmitting(false);
                }
            } else if (currentStep < totalSteps) {
                setCurrentStep((prev) => prev + 1);
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    if (isLoading) {
        return (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <p className="text-slate-500">Initializing form...</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-slate-100 p-8 md:p-12">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Intake Form</h1>
                    <p className="text-slate-500 mb-10">{progressComments[currentStep - 1]}</p>
                </div>

                <StepperHeader currentStep={currentStep} totalSteps={totalSteps} />

                <FormProvider {...methods}>
                    <form className="space-y-8 mt-12">
                        {currentStep === 1 && <PersonalInfoStep />}
                        {currentStep === 2 && <PersonalInfoStep2 />}
                        {currentStep === 3 && <PersonalInfoStep3 />}
                        {currentStep === 4 && <MedicalInfoStep />}
                        {currentStep === 5 && <ReviewStep />}

                        {currentStep <= totalSteps && (
                            <div className="flex items-center justify-between pt-6">
                                {currentStep > 1 ? (
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        className="text-slate-500 font-bold py-2 px-6 rounded-3xl transition-all hover:bg-slate-100 active:scale-95"
                                    >
                                        Back
                                    </button>
                                ) : (
                                    <div />
                                )}
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={isSubmitting}
                                    className="bg-black hover:bg-white text-white hover:text-black border-1 border-black font-bold py-2 px-6 rounded-3xl shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {currentStep === 5 ? (isSubmitting ? "Submitting..." : "Submit") : "Continue"}
                                </button>
                            </div>
                        )}
                    </form>
                </FormProvider>
            </div>
        </main>
    );
}

export default function IntakePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">Loading Form Data...</div>}>
            <IntakeForm />
        </Suspense>
    );
}

// --- Sub-Components ---

function StepperHeader({ currentStep, totalSteps }) {
    const icons = [User, MapPin, Layers, Bookmark, ClipboardList];
    const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

    return (
        <div className="relative flex justify-between items-center max-w-3xl mx-auto">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
            <div
                className="absolute top-1/2 left-0 h-0.5 bg-black -translate-y-1/2 z-0 transition-all duration-500"
                style={{ width: `${progress}%` }}
            />
            {icons.map((Icon, i) => {
                const stepNum = i + 1;
                const isActive = currentStep >= stepNum;
                return (
                    <div key={i} className="relative z-10">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all 
              ${isActive ? "bg-black border-black text-white" : "bg-white border-slate-200 text-slate-300"}`}>
                            <Icon size={20} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function PersonalInfoStep() {
    const { register, formState: { errors } } = useFormContext();

    return (
        <div className="grid grid-cols-12 gap-x-6 gap-y-8">
            <div className="col-span-12 md:col-span-4 flex flex-col gap-2">
                <label htmlFor="fullName" className="text-xs font-bold text-slate-500 ">Full Name:</label>
                <input
                    id="fullName"
                    className="p-3 rounded bg-slate-50 border border-slate-100 text-sm"
                    placeholder="Alvin Wambia"
                    {...register("fullName")}
                />
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
            </div>
            <div className="col-span-12 md:col-span-3 flex flex-col gap-2">
                <label htmlFor="email" className="text-xs font-bold text-slate-500 ">Email</label>
                <input
                    id="email"
                    className="p-3 rounded bg-slate-50 border border-slate-100 text-sm"
                    placeholder="wambialvin@gmail.com"
                    {...register("email")}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div className="col-span-12 md:col-span-2 flex flex-col gap-2">
                <label htmlFor="birthDate" className="text-xs font-bold text-slate-500 ">Date of Birth</label>
                <input
                    id="birthDate"
                    type="date"
                    className="p-3 rounded bg-slate-50 border border-slate-100 text-sm"
                    {...register("birthDate")}
                />
                {errors.birthDate && <p className="text-red-500 text-sm mt-1">{errors.birthDate.message}</p>}
            </div>
            <div className="col-span-12 md:col-span-3 flex flex-col gap-2">
                <label htmlFor="phoneNumber" className="text-xs font-bold text-slate-500 ">Phone Number</label>
                <input
                    id="phoneNumber"
                    type="tel"
                    className="p-3 rounded bg-slate-50 border border-slate-100 text-sm"
                    placeholder="+1 234 567 890"
                    {...register("phoneNumber")}
                />
                {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>}
            </div>
            <div className="col-span-12 md:col-span-12 flex flex-col gap-2">
                <label htmlFor="gender" className="text-xs font-bold text-slate-500 ">Gender</label>
                <select id="gender" className="p-3 rounded bg-slate-50 border border-slate-100 text-sm" {...register("gender")}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
                {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>}
            </div>
            {/* Add more inputs for other fields following the same grid pattern */}
        </div>
    );
}


function PersonalInfoStep2() {
    const { register, watch, formState: { errors } } = useFormContext();
    const [tdee, setTdee] = useState(0);

    // Watch for changes in the fields needed for TDEE calculation
    const weight = watch("currentWeight");
    const height = watch("height");
    const birthDate = watch("birthDate");
    const gender = watch("gender");
    const activityLevel = watch("activityLevel");

    React.useEffect(() => {
        const calculateTDEE = () => {
            const age = calculateAge(birthDate);
            const numWeight = parseFloat(weight);
            const numHeight = parseFloat(height);
            const numAge = age;

            if (isNaN(numWeight) || isNaN(numHeight) || isNaN(numAge) || numWeight <= 0 || numHeight <= 0 || numAge <= 0) {
                setTdee(0);
                return;
            }

            // BMR Calculation (Mifflin-St Jeor Equation)
            let bmr;
            if (gender === 'Male') {
                bmr = 10 * numWeight + 6.25 * numHeight - 5 * numAge + 5;
            } else { // 'Female'
                bmr = 10 * numWeight + 6.25 * numHeight - 5 * numAge - 161;
            }

            // Activity Level Multipliers
            const activityMultipliers = {
                sedentary: 1.2,
                light: 1.375,
                moderate: 1.55,
                active: 1.725,
                very_active: 1.9,
            };

            const multiplier = activityMultipliers[activityLevel] || 1.2;
            const calculatedTdee = bmr * multiplier;

            setTdee(Math.round(calculatedTdee));
        };

        calculateTDEE();
    }, [weight, height, birthDate, gender, activityLevel]);

    return (
        <div className="grid grid-cols-12 gap-x-6 gap-y-8">
            <div className="col-span-12 md:col-span-6 flex flex-col gap-2">
                <label htmlFor="currentWeight" className="text-xs font-bold text-slate-500 ">What's your current weight? (kg)</label>
                <input
                    id="currentWeight"
                    className="p-3 rounded bg-slate-50 border border-slate-100 text-sm"
                    placeholder="70"
                    type="number"
                    {...register("currentWeight")}
                />
                {errors.currentWeight && <p className="text-red-500 text-sm mt-1">{errors.currentWeight.message}</p>}
            </div>
            <div className="col-span-12 md:col-span-6 flex flex-col gap-2">
                <label htmlFor="height" className="text-xs font-bold text-slate-500 ">How tall are you? (cm)</label>
                <input
                    id="height"
                    className="p-3 rounded bg-slate-50 border border-slate-100 text-sm"
                    placeholder="175"
                    type="number"
                    {...register("height")}
                />
                {errors.height && <p className="text-red-500 text-sm mt-1">{errors.height.message}</p>}
            </div>

            <div className="col-span-12 md:col-span-6 flex flex-col gap-2">
                <label htmlFor="trainingLevel" className="text-xs font-bold text-slate-500 ">What's your current training level?</label>
                <select id="trainingLevel" className="p-3 rounded bg-slate-50 border border-slate-100 text-sm" {...register("trainingLevel")}>
                    <option value="beginner">Beginner (0-1 years)</option>
                    <option value="intermediate">Intermediate (1-3 years)</option>
                    <option value="advanced">Advanced (3+ years)</option>
                </select>
                {errors.trainingLevel && <p className="text-red-500 text-sm mt-1">{errors.trainingLevel.message}</p>}
            </div>
            <div className="col-span-12 md:col-span-6 flex flex-col gap-2">
                <label htmlFor="activityLevel" className="text-xs font-bold text-slate-500 ">How active are you weekly?</label>
                <select id="activityLevel" className="p-3 rounded bg-slate-50 border border-slate-100 text-sm" {...register("activityLevel")}>
                    <option value="sedentary">Sedentary (little or no exercise)</option>
                    <option value="light">Lightly active (light exercise 1-3 days/week)</option>
                    <option value="moderate">Moderately active (moderate exercise 3-5 days/week)</option>
                    <option value="active">Very active (hard exercise 6-7 days a week)</option>
                    <option value="very_active">Extra active (very hard exercise & physical job)</option>
                </select>
                {errors.activityLevel && <p className="text-red-500 text-sm mt-1">{errors.activityLevel.message}</p>}
            </div>

            <div className="col-span-12 mt-4 p-4 bg-slate-100 rounded-lg">
                <h3 className="text-sm font-bold text-slate-800">Estimated Daily Calorie Needs (TDEE)</h3>
                <p className="text-2xl font-bold text-black mt-1">
                    {tdee > 0 ? `${tdee} calories/day` : 'Enter your details to calculate'}
                </p>
                <p className="text-xs text-slate-500 mt-1">This is an estimate of the calories you burn per day. Your actual needs may vary.</p>
            </div>
        </div>
    );
}


function PersonalInfoStep3() {
    const { register, watch, formState: { errors } } = useFormContext();
    const selectedGoal = watch("goal");

    return (
        <div className="grid grid-cols-12 gap-x-6 gap-y-8">
            <div className="col-span-12 md:col-span-6 flex flex-col gap-2">
                <label htmlFor="goal" className="text-xs font-bold text-slate-500">What's your main goal?</label>
                <select
                    id="goal"
                    className="p-3 rounded bg-slate-50 border border-slate-100 text-sm"
                    {...register("goal")}
                >
                    <option value="">Select a goal...</option>
                    <option value="lose-weight">Lose Weight</option>
                    <option value="gain-muscle">Gain Muscle</option>
                    <option value="improve-endurance">Improve Endurance</option>
                    <option value="general-fitness">General Fitness</option>
                </select>
                {errors.goal && <p className="text-red-500 text-sm mt-1">{errors.goal.message}</p>}
            </div>

            {selectedGoal === 'lose-weight' && (
                <div className="col-span-12 md:col-span-6 flex flex-col gap-2">
                    <label htmlFor="targetWeight" className="text-xs font-bold text-slate-500 ">What's your target weight? (kg) (Optional)</label>
                    <input
                        id="targetWeight"
                        className="p-3 rounded bg-slate-50 border border-slate-100 text-sm"
                        placeholder="65"
                        type="number"
                        {...register("targetWeight")}
                    />
                    {errors.targetWeight && <p className="text-red-500 text-sm mt-1">{errors.targetWeight.message}</p>}
                </div>
            )}

            <div className="col-span-12 flex flex-col gap-2">
                <label htmlFor="goalDescription" className="text-xs font-bold text-slate-500 ">Describe your goal in more detail (Optional)</label>
                <textarea
                    id="goalDescription"
                    rows={3}
                    className="p-3 rounded bg-slate-50 border border-slate-100 text-sm w-full"
                    placeholder="Define what you would want to achieve"
                    {...register("goalDescription")}
                />
                {errors.goalDescription && <p className="text-red-500 text-sm mt-1">{errors.goalDescription.message}</p>}
            </div>
        </div>
    );
}

function MedicalInfoStep() {
    const { register, formState: { errors } } = useFormContext();
    return (
        <div className="grid grid-cols-12 gap-x-6 gap-y-8">
            <div className="col-span-12 flex flex-col gap-2">
                <label htmlFor="injuries" className="text-xs font-bold text-slate-500">Any past or current injuries? (Optional)</label>
                <textarea
                    id="injuries"
                    rows={4}
                    className="p-3 rounded bg-slate-50 border border-slate-100 text-sm w-full"
                    placeholder="e.g., Knee pain when squatting, previous shoulder dislocation..."
                    {...register("injuries")}
                />
                {errors.injuries && <p className="text-red-500 text-sm mt-1">{errors.injuries.message}</p>}
            </div>
            <div className="col-span-12 flex flex-col gap-2">
                <label htmlFor="medicalConditions" className="text-xs font-bold text-slate-500">Any medical conditions we should be aware of? (Optional)</label>
                <textarea
                    id="medicalConditions"
                    rows={4}
                    className="p-3 rounded bg-slate-50 border border-slate-100 text-sm w-full"
                    placeholder="e.g., Asthma, high blood pressure, diabetes..."
                    {...register("medicalConditions")}
                />
                {errors.medicalConditions && <p className="text-red-500 text-sm mt-1">{errors.medicalConditions.message}</p>}
            </div>
        </div>
    );
}

function TrainingPreferencesStep() {
    const { register, formState: { errors } } = useFormContext();

    return (
        <div className="grid grid-cols-12 gap-x-6 gap-y-8">
            <div className="col-span-12 md:col-span-6 flex flex-col gap-2">
                <label htmlFor="meetingDate" className="text-xs font-bold text-slate-500">Meeting Date</label>
                <input
                    id="meetingDate"
                    type="date"
                    className="p-3 rounded bg-slate-50 border border-slate-100 text-sm"
                    {...register("meetingDate")}
                />
                {errors.meetingDate && <p className="text-red-500 text-sm mt-1">{errors.meetingDate.message}</p>}
            </div>
            <div className="col-span-12 md:col-span-6 flex flex-col gap-2">
                <label htmlFor="meetingTime" className="text-xs font-bold text-slate-500">Meeting Time (Max 6:00 PM)</label>
                <input
                    id="meetingTime"
                    type="time"
                    className="p-3 rounded bg-slate-50 border border-slate-100 text-sm"
                    {...register("meetingTime")}
                />
                {errors.meetingTime && <p className="text-red-500 text-sm mt-1">{errors.meetingTime.message}</p>}
            </div>
        </div>
    );
}

function ReviewStep({ bookingUrl, isScheduled }) {
    const { getValues } = useFormContext();
    const formData = getValues();

    const formatDisplayValue = (value) => {
        if (Array.isArray(value)) {
            return value.length > 0 ? value.join(', ') : 'N/A';
        }
        if (typeof value === 'string' && value) {
            // Capitalize first letter and replace hyphens
            return value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');
        }
        return value || 'N/A';
    };

    return (
        <div className="space-y-6 animate-in fade-in-0 duration-500">
            <h3 className="text-xl font-bold text-slate-800">Review Your Information</h3>
            <p className="text-sm text-slate-500">Please review all the information you've provided before submitting the form.</p>

            <div className="space-y-4">
                {/* Section for Personal Info */}
                <details className="p-4 border rounded-lg" open>
                    <summary className="text-lg font-semibold cursor-pointer">Personal Information</summary>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mt-4 text-sm">
                        <p><strong>Full Name:</strong> {formatDisplayValue(formData.fullName)}</p>
                        <p><strong>Email:</strong> {formData.email || 'N/A'}</p>
                        <p><strong>Phone Number:</strong> {formatDisplayValue(formData.phoneNumber)}</p>
                        <p><strong>Date of Birth:</strong> {formatDisplayValue(formData.birthDate)}</p>
                        <p><strong>Gender:</strong> {formatDisplayValue(formData.gender)}</p>
                    </div>
                </details>

                {/* Section for Body & Activity */}
                <details className="p-4 border rounded-lg" open>
                    <summary className="text-lg font-semibold cursor-pointer">Body & Activity</summary>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mt-4 text-sm">
                        <p><strong>Current Weight:</strong> {formData.currentWeight ? `${formData.currentWeight} kg` : 'N/A'}</p>
                        <p><strong>Height:</strong> {formData.height ? `${formData.height} cm` : 'N/A'}</p>
                        <p><strong>Training Level:</strong> {formatDisplayValue(formData.trainingLevel)}</p>
                        <p><strong>Activity Level:</strong> {formatDisplayValue(formData.activityLevel)}</p>
                    </div>
                </details>

                {/* Section for Goals */}
                <details className="p-4 border rounded-lg" open>
                    <summary className="text-lg font-semibold cursor-pointer">Goals</summary>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mt-4 text-sm">
                        <p><strong>Main Goal:</strong> {formatDisplayValue(formData.goal)}</p>
                        {formData.goal === 'lose-weight' && <p><strong>Target Weight:</strong> {formData.targetWeight ? `${formData.targetWeight} kg` : 'N/A'}</p>}
                    </div>
                    <div className="mt-2 text-sm">
                        <p><strong>Goal Description:</strong></p>
                        <p className="pl-2 text-slate-600">{formatDisplayValue(formData.goalDescription)}</p>
                    </div>
                </details>

                {/* Section for Medical */}
                <details className="p-4 border rounded-lg" open>
                    <summary className="text-lg font-semibold cursor-pointer">Medical Information</summary>
                    <div className="mt-4 text-sm space-y-2">
                        <div>
                            <p><strong>Injuries:</strong></p>
                            <p className="pl-2 text-slate-600">{formatDisplayValue(formData.injuries)}</p>
                        </div>
                        <div>
                            <p><strong>Medical Conditions:</strong></p>
                            <p className="pl-2 text-slate-600">{formatDisplayValue(formData.medicalConditions)}</p>
                        </div>
                    </div>
                </details>
            </div>
        </div>
    );
}

function getFieldsByStep(step) {
    switch (step) {
        case 1:
            return ["fullName", "email", "phoneNumber", "birthDate", "gender"];
        case 2:
            return ["currentWeight", "height", "activityLevel", "trainingLevel"];
        case 3:
            return ["goal", "targetWeight", "goalDescription"];
        case 4:
            return ["injuries", "medicalConditions"];
        default:
            return [];
    }
}