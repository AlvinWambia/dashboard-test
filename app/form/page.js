"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, MapPin, Layers, Users, Bookmark, ClipboardList, Check } from "lucide-react";
import { createClient } from "@/supabase/client";

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
    trainingDays: z.array(z.string()).optional(),
    trainingTime: z.string().optional(),
    trainingLocation: z.string().optional(),
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

export default function IntakePage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 7;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

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
            trainingDays: [],
            trainingTime: "",
            trainingLocation: "gym",
        },
    });

    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    router.push('/auth/login');
                    return;
                }

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (!profile || profile.role !== 'admin') {
                    router.push('/home2');
                    return;
                }

                methods.setValue('fullName', profile.full_name || '');
                methods.setValue('email', user.email || '');

            } catch (error) {
                console.error("Error checking user:", error);
            } finally {
                setIsLoading(false);
            }
        };

        checkUser();
    }, [supabase, router, methods]);

    const progressComments = [
        "Let's start with your personal details.",
        "Great! Now tell us about your body and activity level.",
        "What are your fitness goals?",
        "Any medical conditions we should be aware of?",
        "How do you prefer to train?",
        "Almost there! Please review your information.",
        "You're all set! Welcome aboard."
    ];

    // Handle step transitions with validation
    const handleNext = async () => {
        // On the review step, validate all fields. Otherwise, just the current step's fields.
        const fieldsToValidate = currentStep === 6 ? undefined : getFieldsByStep(currentStep);
        const isValid = await methods.trigger(fieldsToValidate);

        if (isValid) {
            if (currentStep === 6) {
                setIsSubmitting(true);
                try {
                    const formData = methods.getValues();

                    // Get current user session (if exists)
                    const { data: { user } } = await supabase.auth.getUser();

                    const { error } = await supabase.from('client_intake_forms').insert({
                        user_id: user?.id || null,
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
                        training_days: formData.trainingDays,
                        training_time: formData.trainingTime,
                        training_location: formData.trainingLocation,
                    });

                    if (error) throw error;

                    setCurrentStep((prev) => prev + 1);
                } catch (error) {
                    console.error("Error submitting form:", error);
                    alert("There was an error submitting your form. Please try again.");
                } finally {
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
                <p className="text-slate-500">Loading...</p>
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
                        {currentStep === 5 && <TrainingPreferencesStep />}
                        {currentStep === 6 && <ReviewStep />}
                        {currentStep === totalSteps && <SuccessStep />}

                        {currentStep < totalSteps && (
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
                                    <div /> // Placeholder to keep Continue button on the right
                                )}
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={isSubmitting}
                                    className="bg-black hover:bg-white text-white hover:text-black border-1 border-black font-bold py-2 px-6 rounded-3xl shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {currentStep === 6 ? (isSubmitting ? "Submitting..." : "Submit") : "Continue"}
                                </button>
                            </div>
                        )}
                    </form>
                </FormProvider>
            </div>
        </main>
    );
}

// --- Sub-Components ---

function StepperHeader({ currentStep, totalSteps }) {
    const icons = [User, MapPin, Layers, Users, Bookmark, ClipboardList, Check];
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
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    return (
        <div className="grid grid-cols-12 gap-x-6 gap-y-8">
            <div className="col-span-12 flex flex-col gap-3">
                <label className="text-xs font-bold text-slate-500">What are your preferred training days? (Optional)</label>
                <div className="flex flex-wrap gap-4">
                    {days.map(day => (
                        <div key={day} className="flex items-center gap-2">
                            <input type="checkbox" id={`day-${day}`} value={day} {...register("trainingDays")} className="h-4 w-4" />
                            <label htmlFor={`day-${day}`} className="text-sm">{day}</label>
                        </div>
                    ))}
                </div>
            </div>
            <div className="col-span-12 md:col-span-6 flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500">Where do you mostly do your workouts?</label>
                <div className="flex gap-6 pt-2">
                    <div className="flex items-center gap-2">
                        <input type="radio" id="loc-gym" value="gym" {...register("trainingLocation")} className="h-4 w-4" />
                        <label htmlFor="loc-gym" className="text-sm">Gym</label>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="radio" id="loc-home" value="home" {...register("trainingLocation")} className="h-4 w-4" />
                        <label htmlFor="loc-home" className="text-sm">Home</label>
                    </div>
                </div>
            </div>
            <div className="col-span-12 md:col-span-6 flex flex-col gap-2">
                <label htmlFor="trainingTime" className="text-xs font-bold text-slate-500">What's your preferred training time? (Optional)</label>
                <input
                    id="trainingTime"
                    className="p-3 rounded bg-slate-50 border border-slate-100 text-sm"
                    placeholder="e.g., Morning, Afternoon, 5-7 PM"
                    {...register("trainingTime")}
                />
            </div>
        </div>
    );
}

function ReviewStep() {
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

                {/* Section for Preferences */}
                <details className="p-4 border rounded-lg" open>
                    <summary className="text-lg font-semibold cursor-pointer">Training Preferences</summary>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mt-4 text-sm">
                        <p><strong>Preferred Days:</strong> {formatDisplayValue(formData.trainingDays)}</p>
                        <p><strong>Preferred Location:</strong> {formatDisplayValue(formData.trainingLocation)}</p>
                        <p><strong>Preferred Time:</strong> {formatDisplayValue(formData.trainingTime)}</p>
                    </div>
                </details>
            </div>
        </div>
    );
}

function SuccessStep() {
    return (
        <div className="text-center py-10 space-y-4">
            <div className="text-6xl">✅</div>
            <h2 className="text-2xl font-bold">Form intake Complete!</h2>
            <p className="text-slate-500">Success. You will be getting a confirmation email shortly with your payment receipt. </p>
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
        case 5:
            return ["trainingDays", "trainingTime", "trainingLocation"];
        default:
            return [];
    }
}