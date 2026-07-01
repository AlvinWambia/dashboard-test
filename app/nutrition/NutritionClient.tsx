"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Search, Clock, Flame, Apple, Plus, X, Upload, Check, ChevronRight, HelpCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/supabase/client";
import nutritionimage1 from "@/components/images/nutritionimage1.jpeg";
import nutritionimage2 from "@/components/images/nutritionimage2.jpeg";
import nutritionimage3 from "@/components/images/nutritionimage3.jpeg";
import nutritionimage4 from "@/components/images/nutritionimage4.jpeg";

// High quality Unsplash placeholder images for premium looks
const DEFAULT_MEALS = [
  {
    id: "m1",
    meal_type: "Breakfast",
    description: "Nourishing Berry & Acai bowl with organic chia, hemp seeds, fresh organic raspberries, and almonds.",
    image_url: "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&q=80&w=800",
    posted_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    macros: { protein: 12, carbs: 42, fat: 8 }
  },
  {
    id: "m2",
    meal_type: "Lunch",
    description: "Post-workout performance plate. Citrus grilled wild salmon, steamed asparagus, herb-seasoned tri-color quinoa.",
    image_url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=800",
    posted_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    macros: { protein: 42, carbs: 35, fat: 18 }
  },
  {
    id: "m3",
    meal_type: "Snack",
    description: "Mid-day energy match. Handcrafted protein bar with dates, oats, cocoa nibs, and organic plant protein.",
    image_url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=800",
    posted_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    macros: { protein: 20, carbs: 18, fat: 9 }
  },
  {
    id: "m4",
    meal_type: "Dinner",
    description: "Tender sesame-crusted tofu, sautéed rainbow vegetables, avocado slices, and a splash of ginger amino dressing.",
    image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800",
    posted_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // yesterday
    macros: { protein: 25, carbs: 22, fat: 14 }
  }
];

const DEFAULT_RECIPES = [
  {
    id: "r1",
    title: "Greek Avocado Quinoa Salad",
    description: "A crisp, refreshing Mediterranean-style salad packed with protein, healthy fats, and complex carbs. Perfect for meal prep.",
    category: "lunch",
    prep_time: "15 mins",
    calories: 420,
    image_url: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=80&w=800",
    macros: { protein: 14, carbs: 48, fat: 19 },
    ingredients: [
      "1 cup dry quinoa (cooked)",
      "1 ripe avocado (diced)",
      "1 cup cherry tomatoes (halved)",
      "1 English cucumber (diced)",
      "1/2 cup crumbled feta cheese",
      "2 tbsp extra virgin olive oil",
      "Juice of 1 fresh lemon",
      "Salt and black pepper to taste"
    ],
    instructions: [
      "Rinse and cook quinoa according to package instructions, then let it cool to room temp.",
      "In a large salad bowl, combine the cooled quinoa, tomatoes, cucumber, and feta.",
      "Whisk olive oil and lemon juice together, then drizzle over the salad.",
      "Gently fold in the diced avocado to avoid mashing. Season with salt and pepper.",
      "Serve chilled or pack for weekly lunches!"
    ]
  },
  {
    id: "r2",
    title: "Vibrant Berry Protein Smoothie",
    description: "Antioxidant-rich booster shake designed for rapid muscle recovery post-workout.",
    category: "smoothie",
    prep_time: "5 mins",
    calories: 310,
    image_url: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&q=80&w=800",
    macros: { protein: 28, carbs: 32, fat: 5 },
    ingredients: [
      "1 scoop vanilla plant protein powder",
      "1 cup mixed frozen organic berries",
      "1 cup unsweetened almond milk",
      "1 tbsp chia seeds",
      "1/2 frozen banana"
    ],
    instructions: [
      "Add almond milk to the blender first to prevent powder sticking.",
      "Add protein powder, berries, banana, and chia seeds.",
      "Blend on high speed for 60 seconds until creamy and smooth.",
      "Pour into your favorite glass and top with a few fresh blueberries."
    ]
  },
  {
    id: "r3",
    title: "High-Protein Almond Oats Bowl",
    description: "Slow-releasing complex carbs paired with high-quality protein to keep you satiated all morning.",
    category: "breakfast",
    prep_time: "10 mins",
    calories: 380,
    image_url: "https://images.unsplash.com/photo-1517881917431-13488d537841?auto=format&fit=crop&q=80&w=800",
    macros: { protein: 22, carbs: 45, fat: 12 },
    ingredients: [
      "1/2 cup organic rolled oats",
      "1 cup water or unsweetened milk",
      "1/2 scoop protein powder",
      "1 tbsp almond butter",
      "Handful of fresh raspberries",
      "Sprinkle of cinnamon"
    ],
    instructions: [
      "Combine oats and liquid in a saucepan. Bring to a gentle boil, then simmer for 5 minutes.",
      "Remove from heat and stir in the protein powder until fully dissolved.",
      "Transfer to a bowl and swirl in the almond butter.",
      "Top with fresh raspberries, cinnamon, and optional cacao nibs."
    ]
  },
  {
    id: "r4",
    title: "Maple Mustard Glazed Salmon",
    description: "Deliciously caramelized omega-3 rich salmon fillet cooked to tender perfection.",
    category: "dinner",
    prep_time: "20 mins",
    calories: 490,
    image_url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800",
    macros: { protein: 38, carbs: 12, fat: 22 },
    ingredients: [
      "2 salmon fillets (6oz each)",
      "1 tbsp pure maple syrup",
      "1 tbsp Dijon mustard",
      "1 clove garlic (minced)",
      "1 tsp soy sauce or tamari",
      "1 tbsp olive oil"
    ],
    instructions: [
      "Preheat your oven to 400°F (200°C). Line a baking sheet with parchment paper.",
      "In a small bowl, whisk maple syrup, mustard, minced garlic, soy sauce, and olive oil.",
      "Place salmon fillets skin-side down on the sheet and brush generously with the glaze.",
      "Bake for 12-15 minutes until the salmon flakes easily with a fork.",
      "Serve with side of roasted broccoli or brown rice."
    ]
  }
];

interface NutritionClientProps {
  initialRecipes: any[];
  initialMeals: any[];
  dbConnected: boolean;
}

export default function NutritionClient({ initialRecipes, initialMeals, dbConnected }: NutritionClientProps) {
  const router = useRouter();
  const supabase = createClient();

  // Combine live data with default premium mock fallbacks
  const [recipes, setRecipes] = useState(
    initialRecipes && initialRecipes.length > 0 ? initialRecipes : DEFAULT_RECIPES
  );
  const [meals, setMeals] = useState(
    initialMeals && initialMeals.length > 0 ? initialMeals : DEFAULT_MEALS
  );

  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null);
  const [activeRecipeTab, setActiveRecipeTab] = useState<"ingredients" | "instructions">("ingredients");
  const [activeMealIndex, setActiveMealIndex] = useState(0);

  // Filters recipes
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || recipe.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Simple relative time calculator
  const formatRelativeTime = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHrs = Math.floor(diffMins / 60);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHrs < 24) return `${diffHrs}h ago`;
      return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="min-h-screen bg-white text-black selection:bg-emerald-500 selection:text-black">


      {/* HEADER NAVBAR */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-white/5">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-4">
          {!dbConnected && (
            <div className="flex items-center gap-1.5 text-xs bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/20">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Offline Fallback Active</span>
            </div>
          )}
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="max-w-7xl mx-auto px-6 pt-10 pb-20 text-center overflow-hidden">
        <div className="max-w-3xl mx-auto relative z-10 mb-14 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <span className="bg-slate-100 border text-slate-700 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider flex items-center gap-1.5 cursor-pointer hover:bg-slate-200 transition-colors">
              <span>Welcome to myfit's nutrition</span>

            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight"
          >
            Delicious Nutritious Recipes <br />
            <span className="text-emerald-400">For Every Meal</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-gray-500 text-xs md:text-sm max-w-xl mx-auto leading-relaxed"
          >
            Discover a wide range of recipes crafted to boost your health, support your fitness goals, and make nutritious eating enjoyable.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center justify-center gap-3 pt-2"
          >
            <button
              onClick={() => {
                const element = document.getElementById("recipe-hub");
                element?.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-emerald-500  hover:bg-slate-800 text-sm font-semibold py-3 px-6 rounded-full transition-all shadow-md"
            >
              What I Ate
            </button>
            <button
              onClick={() => {
                const element = document.getElementById("what-i-ate");
                element?.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-white border border-emerald-400 text-emerald-500 hover:bg-slate-50 text-sm font-semibold py-3 px-6 rounded-full transition-all"
            >
              My recipes
            </button>
          </motion.div>

          {/* Social Proof Line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pt-6 text-xs text-slate-500 font-medium"
          >
            <div className="flex items-center gap-2">
              {/* Stacked Mock Avatars */}
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full border border-white bg-slate-200 overflow-hidden flex items-center justify-center font-bold text-[8px]">👩</div>
                <div className="w-6 h-6 rounded-full border border-white bg-emerald-100 overflow-hidden flex items-center justify-center font-bold text-[8px]">👱‍♀️</div>
                <div className="w-6 h-6 rounded-full border border-white bg-blue-100 overflow-hidden flex items-center justify-center font-bold text-[8px]">🧔</div>
              </div>
              <span>Trusted By Food Lovers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Sneak Peek of What I Ate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>A Wide Range Of My Healthy Recipes</span>
            </div>
          </motion.div>
        </div>

        {/* Hero Gallery Grid (Mockup Style) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto mt-10">
          {[
            nutritionimage1.src,
            nutritionimage2.src,
            nutritionimage3.src,
            nutritionimage4.src
          ].map((imgUrl, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + idx * 0.1 }}
              className="relative aspect-[3/4] rounded-[0.5rem] overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <img
                src={imgUrl}
                alt="Nutritious Meal"
                className="w-full h-full object-cover"
              />
            </motion.div>
          ))}
        </div>
      </header>



      {/* "WHAT I ATE" SECTION */}
      <section id="what-i-ate" className="max-w-7xl mx-auto px-6 py-16 border-t border-slate-100">
        <div className="mb-10 text-center lg:text-left">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center justify-center lg:justify-start gap-2">
            📸 What I Ate
          </h2>
          <p className="text-gray-500 text-sm mt-2">Tap/click the card stack to cycle through my daily food diary or browse the calendar below.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-16">
          {/* Left Side: Overlapping Stack (Cyclical Carousel) */}
          <div className="col-span-12 lg:col-span-5 flex justify-center items-center h-[290px] sm:h-[340px] relative">
            <div
              onClick={() => {
                if (meals.length > 0) {
                  setActiveMealIndex((activeMealIndex + 1) % meals.length);
                }
              }}
              className="relative w-[230px] h-[230px] sm:w-[280px] sm:h-[280px] cursor-pointer"
            >
              {meals.length > 0 && [2, 1, 0].map((stackOffset) => {
                const mealIdx = (activeMealIndex + stackOffset) % meals.length;
                const meal = meals[mealIdx];
                if (!meal) return null;

                // Rotations and styling based on position in stack
                const rotation = stackOffset === 0 ? 0 : stackOffset === 1 ? 6 : -6;
                const scale = stackOffset === 0 ? 1 : stackOffset === 1 ? 0.95 : 0.9;
                const zIndex = 30 - stackOffset;
                const opacity = stackOffset === 0 ? 1 : stackOffset === 1 ? 0.8 : 0.5;

                return (
                  <motion.div
                    key={meal.id + "-" + stackOffset}
                    style={{ zIndex, transformOrigin: "bottom center" }}
                    animate={{
                      rotate: rotation,
                      scale: scale,
                      opacity: opacity,
                      y: stackOffset * 10,
                      x: stackOffset * 5
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="absolute inset-0  rounded-[1.5rem] sm:rounded-[2rem]  shadow-lg "
                  >
                    <div className="relative w-full h-full rounded-[1.1rem] sm:rounded-[1.6rem] overflow-hidden bg-slate-50">
                      <img
                        src={meal.image_url}
                        alt={meal.meal_type}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-sm text-white text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full">
                        {meal.meal_type}
                      </div>
                      {stackOffset === 0 && (
                        <div className="absolute bottom-2.5 right-2.5 bg-white/90 backdrop-blur-sm text-slate-800 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 sm:py-1 rounded-full shadow-sm">
                          Tap to Flip ➔
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Side: Description Panel */}
          <div className="col-span-12 lg:col-span-7 space-y-4 sm:space-y-6 bg-slate-50 p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200/50">
            {meals.length > 0 && meals[activeMealIndex] && (
              <motion.div
                key={activeMealIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-4 sm:space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-3 sm:pb-4">
                  <div>
                    <span className="text-[9px] sm:text-[10px] text-emerald-500 font-bold uppercase tracking-widest block">Logged Entry</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{meals[activeMealIndex].meal_type} Update</h3>
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-500">{formatRelativeTime(meals[activeMealIndex].posted_at)}</span>
                </div>

                <blockquote className="text-slate-700 text-sm sm:text-base md:text-lg italic leading-relaxed font-serif">
                  &ldquo;{meals[activeMealIndex].description}&ldquo;
                </blockquote>

                {meals[activeMealIndex].macros && (
                  <div className="space-y-2 sm:space-y-3">
                    <h4 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Macros Breakdown</h4>
                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                      <div className="bg-white border border-slate-200/60 p-2 sm:p-3 rounded-xl sm:rounded-2xl text-center shadow-sm">
                        <p className="text-[9px] sm:text-[10px] uppercase font-semibold text-slate-400">Protein</p>
                        <p className="text-sm sm:text-base font-bold text-emerald-500 mt-0.5">{meals[activeMealIndex].macros.protein}g</p>
                      </div>
                      <div className="bg-white border border-slate-200/60 p-2 sm:p-3 rounded-xl sm:rounded-2xl text-center shadow-sm">
                        <p className="text-[9px] sm:text-[10px] uppercase font-semibold text-slate-400">Carbs</p>
                        <p className="text-sm sm:text-base font-bold text-blue-500 mt-0.5">{meals[activeMealIndex].macros.carbs}g</p>
                      </div>
                      <div className="bg-white border border-slate-200/60 p-2 sm:p-3 rounded-xl sm:rounded-2xl text-center shadow-sm">
                        <p className="text-[9px] sm:text-[10px] uppercase font-semibold text-slate-400">Fat</p>
                        <p className="text-sm sm:text-base font-bold text-orange-500 mt-0.5">{meals[activeMealIndex].macros.fat}g</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-1 flex items-center justify-between text-[10px] sm:text-xs text-gray-400">
                  <span className="font-semibold text-emerald-500">@_.peleisa</span>
                  <span>Logging</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* MONTHLY DAILY GRID SECTION */}
        {(() => {
          // Group meals by calendar day (using posted_at date)
          const mealsByDay: Record<string, { meals: any[]; firstIndex: number }> = {};
          meals.forEach((meal, idx) => {
            const d = new Date(meal.posted_at);
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            if (!mealsByDay[key]) {
              mealsByDay[key] = { meals: [], firstIndex: idx };
            }
            mealsByDay[key].meals.push(meal);
          });

          // Calendar display: show the month/year of the most recent meal, fallback to current
          const refDate = meals.length > 0 ? new Date(meals[0].posted_at) : new Date();
          const displayMonth = refDate.getMonth();
          const displayYear = refDate.getFullYear();
          const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
          // JS getDay(): 0=Sun,1=Mon…6=Sat → convert to Mon-first offset
          const firstDayJS = new Date(displayYear, displayMonth, 1).getDay();
          const offsetCells = firstDayJS === 0 ? 6 : firstDayJS - 1;
          const monthLabel = refDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

          return (
            <div className="mt-16 bg-white border border-slate-200/60 p-4 sm:p-6 md:p-8 rounded-[2rem] shadow-sm space-y-6 max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">{monthLabel} Food Calendar</h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Click any logged day to view its meal entry above.</p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-600 bg-slate-50 border px-3 py-1.5 rounded-full self-start sm:self-auto">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Logged Days Highlighted</span>
                </div>
              </div>

              {/* Week Header */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] sm:text-xs font-semibold text-slate-400 mb-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d}>{d}</div>)}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2 md:gap-3">
                {/* Offset blank cells before the 1st */}
                {Array.from({ length: offsetCells }).map((_, i) => (
                  <div key={`blank-${i}`} className="aspect-square" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const dayNum = index + 1;
                  const dayKey = `${displayYear}-${displayMonth}-${dayNum}`;
                  const dayData = mealsByDay[dayKey];
                  const hasMeal = !!dayData;
                  const dayMeals = dayData?.meals ?? [];
                  const firstMealIndex = dayData?.firstIndex ?? 0;
                  const isSelected = hasMeal && dayMeals.some((_, i) => firstMealIndex + i === activeMealIndex);

                  return (
                    <div
                      key={dayNum}
                      onClick={() => {
                        if (hasMeal) {
                          setActiveMealIndex(firstMealIndex);
                          document.getElementById("what-i-ate")?.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                      className={`relative aspect-square rounded-xl sm:rounded-2xl flex flex-col items-center justify-center border transition-all overflow-hidden ${hasMeal
                        ? isSelected
                          ? "border-emerald-500 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20 cursor-pointer"
                          : "border-slate-200 hover:border-emerald-500 hover:shadow-sm cursor-pointer bg-slate-50/30"
                        : "border-slate-100 bg-slate-50/10 pointer-events-none"
                        }`}
                    >
                      {/* Day Number */}
                      <span className={`absolute top-1 sm:top-1.5 left-1.5 sm:left-2 text-[9px] sm:text-[10px] font-bold z-10 ${isSelected ? "text-emerald-600" : hasMeal ? "text-slate-800" : "text-slate-400"
                        }`}>
                        {dayNum}
                      </span>

                      {/* Stacked thumbnails for this day's meals */}
                      {hasMeal && (
                        <div className="relative w-[70%] h-[70%] mt-3">
                          {dayMeals.slice(0, 3).map((meal: any, stackIdx: number) => {
                            const total = Math.min(dayMeals.length, 3);
                            const spread = total > 1 ? (stackIdx - (total - 1) / 2) * 6 : 0;
                            const rotation = total > 1 ? (stackIdx - (total - 1) / 2) * 5 : 0;
                            return (
                              <div
                                key={meal.id || stackIdx}
                                className="absolute inset-0 rounded-md sm:rounded-lg overflow-hidden shadow border border-white"
                                style={{
                                  zIndex: stackIdx + 1,
                                  transform: `rotate(${rotation}deg) translateX(${spread}px)`,
                                }}
                              >
                                <img
                                  src={meal.image_url}
                                  alt={meal.meal_type}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            );
                          })}
                          {/* Badge showing count if more than 1 */}
                          {dayMeals.length > 1 && (
                            <div className="absolute -top-1.5 -right-1.5 z-20 bg-emerald-500 text-white text-[8px] font-bold w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center shadow">
                              {dayMeals.length}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </section>

      {/* RECIPE HUB */}
      <section id="recipe-hub" className="max-w-7xl mx-auto px-6 py-16 border-t border-slate-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-10 gap-6">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Healthy Recipe Hub</h2>
            <p className="text-gray-500 text-sm mt-2">Filter and check out step-by-step instructions for quick fuel.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-[220px]">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search recipe..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 text-sm rounded-full placeholder-gray-400 w-full focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 border-slate-200"
              />
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide w-full max-w-full -mx-4 px-4 sm:mx-0 sm:px-0 sm:scrollbar-hide md:scrollbar-hide">
              {["all", "breakfast", "lunch", "dinner", "snack", "smoothie"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs font-semibold py-2 px-4 rounded-full border transition-all whitespace-nowrap capitalize ${selectedCategory === cat
                    ? "bg-emerald-500 border-emerald-400 text-black shadow-lg shadow-emerald-500/10"
                    : "bg-slate-50 border-slate-200 text-gray-600 hover:text-emerald-500 hover:border-emerald-500/30"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recipe Grid */}
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 border border-slate-100 rounded-[2rem]">
            <Apple className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800">No recipes found</h3>
            <p className="text-slate-500 text-sm mt-2">Try searching something else or adjust category filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredRecipes.map((recipe) => (
              <motion.div
                key={recipe.id}
                layoutId={`recipe-card-${recipe.id}`}
                onClick={() => setSelectedRecipe(recipe)}
                className="bg-white rounded-3xl shadow-md hover:shadow-xl border border-slate-100 hover:border-emerald-500/20 cursor-pointer group transition-all flex flex-col justify-between"
              >
                <div className="relative aspect-video overflow-hidden rounded-t-3xl">
                  <img
                    src={recipe.image_url}
                    alt={recipe.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-emerald-600 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-sm">
                    {recipe.category}
                  </div>
                </div>

                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight group-hover:text-emerald-500 transition-colors">
                      {recipe.title}
                    </h3>
                    <p className="text-slate-500 text-xs mt-2 line-clamp-2 leading-relaxed">
                      {recipe.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-slate-500">{recipe.prep_time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      <span className="text-slate-500">{recipe.calories} kcal</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* DETAIL MODAL OVERLAY */}
      <AnimatePresence>
        {selectedRecipe && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              layoutId={`recipe-card-${selectedRecipe.id}`}
              className="bg-white border border-slate-100 rounded-[2rem] w-full max-w-4xl max-h-[92vh] md:max-h-[90vh] overflow-y-auto md:overflow-hidden relative shadow-2xl grid grid-cols-1 md:grid-cols-12"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedRecipe(null)}
                className="absolute top-4 right-4 bg-black/40 hover:bg-black/80 border border-white/10 rounded-full p-2 text-white transition-colors z-30"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Left Column: Cover Image & Decorative branding */}
              <div className="col-span-12 md:col-span-5 h-[180px] sm:h-[240px] md:h-auto min-h-[200px] md:min-h-[300px] relative overflow-hidden bg-gray-900 m-3 sm:m-4 md:m-5 rounded-2xl">
                <img
                  src={selectedRecipe.image_url}
                  alt={selectedRecipe.title}
                  className="w-full h-full object-cover absolute rounded-xl inset-0"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60" />

                {/* Branding Element */}
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 flex flex-col">
                  <div className="flex items-center gap-1">
                    <Apple className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                    <span className="font-extrabold text-xs sm:text-sm tracking-wider text-white uppercase">myFit</span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-medium">Inside Healthy Kitchen</span>
                </div>

                {/* Bottom decorative text */}
                <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-10">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-tight">
                    Inside <br />healthy <br />Kitchen
                  </h3>
                  <p className="text-[10px] sm:text-xs text-gray-300 mt-1 sm:mt-2 font-medium">Building healthier community</p>
                </div>
              </div>

              {/* Right Column: Recipe Details & Tabs */}
              <div className="col-span-12 md:col-span-7 p-5 sm:p-6 md:p-8 flex flex-col justify-between h-auto md:max-h-[90vh] md:overflow-y-auto">
                <div className="space-y-6">
                  {/* Title & Serving */}
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-extrabold leading-tight">
                        {selectedRecipe.title}
                      </h2>
                      {/* Sub-ratings */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex text-amber-400">
                          {"★".repeat(5)}
                        </div>
                        <span className="text-xs text-gray-700 font-medium">
                          4.8 Ratings • 120 Reviews
                        </span>
                      </div>
                    </div>

                    <span className="bg-slate-100 text-emerald-400  text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
                      Prep: {selectedRecipe.prep_time || "15 mins"}
                    </span>
                  </div>

                  {/* Macros stats */}
                  <div className="grid grid-cols-4 gap-3 bg-white p-3 rounded-2xl border border-slate-400">
                    <div className="text-center">
                      <p className="text-[9px] uppercase font-bold tracking-wider text-gray-500">Calories</p>
                      <p className="text-sm font-bold text-gray-700 mt-0.5">{selectedRecipe.calories}</p>
                    </div>
                    <div className="text-center border-l border-white/5">
                      <p className="text-[9px] uppercase font-bold tracking-wider text-gray-500">Protein</p>
                      <p className="text-sm font-bold text-emerald-400 mt-0.5">{selectedRecipe.macros.protein}g</p>
                    </div>
                    <div className="text-center border-l border-white/5">
                      <p className="text-[9px] uppercase font-bold tracking-wider text-gray-500">Carbs</p>
                      <p className="text-sm font-bold text-[#3b82f6] mt-0.5">{selectedRecipe.macros.carbs}g</p>
                    </div>
                    <div className="text-center border-l border-white/5">
                      <p className="text-[9px] uppercase font-bold tracking-wider text-gray-500">Fat</p>
                      <p className="text-sm font-bold text-orange-400 mt-0.5">{selectedRecipe.macros.fat}g</p>
                    </div>
                  </div>

                  {/* Tabs switch */}
                  <div className="flex bg-white  ">
                    <button
                      onClick={() => setActiveRecipeTab("ingredients")}
                      className={`flex-1 text-center py-2.5 text-xs font-bold  transition-all ${activeRecipeTab === "ingredients"
                        ? "bg-white text-black border-b-2 border-slate-700"
                        : "text-gray-700 hover:text-black"
                        }`}
                    >
                      Ingredients ({selectedRecipe.ingredients.length})
                    </button>
                    <button
                      onClick={() => setActiveRecipeTab("instructions")}
                      className={`flex-1 text-center py-2.5 text-xs font-bold  transition-all ${activeRecipeTab === "instructions"
                        ? "bg-white text-black border-b-2 border-slate-700"
                        : "text-gray-700 hover:text-black"
                        }`}
                    >
                      Instructions
                    </button>
                  </div>

                  {/* Tab Contents */}
                  <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                    {activeRecipeTab === "ingredients" ? (
                      <div className="space-y-0">
                        {selectedRecipe.ingredients.map((ing: string, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 py-3 border-b border-white/5 last:border-b-0"
                          >
                            <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-sm text-gray-700 font-medium">{ing}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-0">
                        {selectedRecipe.instructions.map((step: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-3 py-3 border-b border-white/5 last:border-b-0">
                            <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <p className="text-sm text-gray-700 font-medium leading-relaxed">
                              {step}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="mt-8 pt-4 border-t border-white/5">
                  <Button
                    onClick={() => setSelectedRecipe(null)}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold py-3.5 rounded-2xl transition-all shadow-lg"
                  >
                    Done Reading
                  </Button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
