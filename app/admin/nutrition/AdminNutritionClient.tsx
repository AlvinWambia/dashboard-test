"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Apple, Plus, Trash2, Check, Clock, Flame, Image as ImageIcon, ChevronRight, BookOpen, AlertCircle, UploadCloud, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/supabase/client";

// ─── Reusable Image Upload Picker ────────────────────────────────────────────
function ImageUploadPicker({
  value,
  onChange,
  bucket = "nutrition-images",
  label = "Photo",
}: {
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  label?: string;
}) {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${ext}`;

      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      onChange(urlData.publicUrl);
    } catch (err: any) {
      console.error("Image upload error:", err);
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      // Reset so the same file can be re-selected
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">
        {label}
      </label>

      {value ? (
        /* ── Preview with hover overlay ── */
        <div className="relative group w-full aspect-video rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <label className="cursor-pointer bg-white text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              Change
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
            </label>
            <button
              type="button"
              onClick={() => onChange("")}
              className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        /* ── Upload drop zone ── */
        <label className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
          uploading ? "border-emerald-300 bg-emerald-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400"
        }`}>
          <div className="flex flex-col items-center gap-2 text-center px-4">
            {uploading ? (
              <>
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-medium text-emerald-600">Uploading...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-7 h-7 text-gray-400" />
                <span className="text-xs font-semibold text-gray-600">Click to upload image</span>
                <span className="text-[10px] text-gray-400">JPG, PNG, WEBP</span>
              </>
            )}
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
        </label>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminNutritionClient() {
  const supabase = createClient();

  // Tab State
  const [activeTab, setActiveTab] = useState<"meals" | "recipes">("meals");

  // Live Lists from database
  const [recentMeals, setRecentMeals] = useState<any[]>([]);
  const [recentRecipes, setRecentRecipes] = useState<any[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);

  // Forms states
  const [mealForm, setMealForm] = useState({
    meal_type: "Breakfast",
    description: "",
    image_url: "",
    protein: "",
    carbs: "",
    fat: ""
  });

  const [recipeForm, setRecipeForm] = useState({
    title: "",
    description: "",
    category: "breakfast",
    prep_time: "15 mins",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    image_url: "",
    ingredients: "",
    instructions: ""
  });

  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Load database lists
  const fetchAdminData = async () => {
    setLoadingLists(true);
    try {
      const [mealsRes, recipesRes] = await Promise.all([
        supabase.from("daily_meals").select("*").order("posted_at", { ascending: false }).limit(10),
        supabase.from("recipes").select("*").order("created_at", { ascending: false }).limit(10)
      ]);

      if (mealsRes.data) setRecentMeals(mealsRes.data);
      if (recipesRes.data) setRecentRecipes(recipesRes.data);
    } catch (err) {
      console.error("Error fetching lists in admin panel:", err);
    } finally {
      setLoadingLists(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Notifications timeout
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Handle Delete Meal
  const handleDeleteMeal = async (id: string) => {
    if (!confirm("Are you sure you want to delete this meal log?")) return;
    try {
      const { error } = await supabase.from("daily_meals").delete().eq("id", id);
      if (error) throw error;
      setRecentMeals(recentMeals.filter(m => m.id !== id));
      setNotification("Meal log deleted successfully.");
    } catch (err) {
      console.error("Error deleting meal:", err);
      setErrorMessage("Could not delete meal database entry.");
    }
  };

  // Handle Delete Recipe
  const handleDeleteRecipe = async (id: string) => {
    if (!confirm("Are you sure you want to delete this recipe?")) return;
    try {
      const { error } = await supabase.from("recipes").delete().eq("id", id);
      if (error) throw error;
      setRecentRecipes(recentRecipes.filter(r => r.id !== id));
      setNotification("Recipe deleted successfully.");
    } catch (err) {
      console.error("Error deleting recipe:", err);
      setErrorMessage("Could not delete recipe database entry.");
    }
  };

  // Submit Meal Log
  const handleMealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!mealForm.image_url || !mealForm.description) {
      setErrorMessage("Please upload a meal photo and add a description.");
      return;
    }
    setUploading(true);

    const newMeal = {
      meal_type: mealForm.meal_type,
      description: mealForm.description,
      image_url: mealForm.image_url,
      posted_at: new Date().toISOString(),
      macros: {
        protein: parseInt(mealForm.protein) || 0,
        carbs: parseInt(mealForm.carbs) || 0,
        fat: parseInt(mealForm.fat) || 0
      }
    };

    try {
      const { data, error } = await supabase
        .from("daily_meals")
        .insert([newMeal])
        .select();

      if (error) throw error;

      if (data) setRecentMeals([data[0], ...recentMeals]);
      setNotification("Meal photo shared successfully!");
      setMealForm({
        meal_type: "Breakfast",
        description: "",
        image_url: "",
        protein: "",
        carbs: "",
        fat: ""
      });
    } catch (err: any) {
      console.error("Error inserting meal:", err);
      setErrorMessage(err.message || "Failed to save to database. Check if Supabase tables are created.");
    } finally {
      setUploading(false);
    }
  };

  // Submit Recipe
  const handleRecipeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!recipeForm.title || !recipeForm.ingredients || !recipeForm.instructions) {
      setErrorMessage("Please fill in the recipe title, ingredients, and instructions.");
      return;
    }
    setUploading(true);

    // Parsing instructions & ingredients into arrays
    const ingredientsArr = recipeForm.ingredients.split("\n").filter(line => line.trim() !== "");
    const instructionsArr = recipeForm.instructions.split("\n").filter(line => line.trim() !== "");

    const newRecipe = {
      title: recipeForm.title,
      description: recipeForm.description,
      category: recipeForm.category,
      prep_time: recipeForm.prep_time,
      calories: parseInt(recipeForm.calories) || 0,
      macros: {
        protein: parseInt(recipeForm.protein) || 0,
        carbs: parseInt(recipeForm.carbs) || 0,
        fat: parseInt(recipeForm.fat) || 0
      },
      image_url: recipeForm.image_url || "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=800",
      ingredients: ingredientsArr,
      instructions: instructionsArr
    };

    try {
      const { data, error } = await supabase
        .from("recipes")
        .insert([newRecipe])
        .select();

      if (error) throw error;

      if (data) setRecentRecipes([data[0], ...recentRecipes]);
      setNotification("Recipe posted successfully!");
      setRecipeForm({
        title: "",
        description: "",
        category: "breakfast",
        prep_time: "15 mins",
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
        image_url: "",
        ingredients: "",
        instructions: ""
      });
    } catch (err: any) {
      console.error("Error inserting recipe:", err);
      setErrorMessage(err.message || "Failed to save to database. Check if Supabase tables are created.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 bg-gray-50 text-gray-900 min-h-screen">
      {/* Toast Alert */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-[#081C15] text-white py-3 px-6 rounded-xl shadow-lg flex items-center gap-2 border border-[#1b4332]">
          <Check className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold">{notification}</span>
        </div>
      )}

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2">
            <Apple className="w-8 h-8 text-[#081C15]" />
            <span>Nutrition &amp; Recipes Manager</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage public healthy recipes and the daily &quot;What I Ate&quot; Locket feed.</p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-gray-200/80 p-1 rounded-xl border border-gray-300/40 self-start md:self-auto">
          <button
            onClick={() => { setActiveTab("meals"); setErrorMessage(""); }}
            className={`text-xs font-bold py-2 px-5 rounded-lg transition-all ${
              activeTab === "meals" ? "bg-white text-[#081C15] shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Daily Meal Logs
          </button>
          <button
            onClick={() => { setActiveTab("recipes"); setErrorMessage(""); }}
            className={`text-xs font-bold py-2 px-5 rounded-lg transition-all ${
              activeTab === "recipes" ? "bg-white text-[#081C15] shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Cookbook Recipes
          </button>
        </div>
      </div>

      {/* Error Alert Box */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Database Action Failed</p>
            <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
            <p className="text-[10px] text-gray-500 mt-2">Make sure you have run the migration query from `supabase/nutrition_schema.sql` in your Supabase SQL Editor.</p>
          </div>
        </div>
      )}

      {/* Main Grid: Form Left, Database List Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: FORM */}
        <div className="lg:col-span-7">
          {activeTab === "meals" ? (
            // LOG DAILY MEAL FORM
            <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Share Daily Photo</h2>
                <p className="text-xs text-gray-500 mt-0.5">Publish instant food photos into the user timeline.</p>
              </div>

              <form onSubmit={handleMealSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Meal Category</label>
                  <select 
                    value={mealForm.meal_type}
                    onChange={(e) => setMealForm({ ...mealForm, meal_type: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option>Breakfast</option>
                    <option>Lunch</option>
                    <option>Dinner</option>
                    <option>Snack</option>
                  </select>
                </div>

                {/* Image Upload Picker for meal */}
                <ImageUploadPicker
                  value={mealForm.image_url}
                  onChange={(url) => setMealForm({ ...mealForm, image_url: url })}
                  bucket="nutrition-images"
                  label="Meal Photo *"
                />

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Protein (g)</label>
                    <input 
                      type="number" 
                      placeholder="20"
                      value={mealForm.protein}
                      onChange={(e) => setMealForm({ ...mealForm, protein: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Carbs (g)</label>
                    <input 
                      type="number" 
                      placeholder="35"
                      value={mealForm.carbs}
                      onChange={(e) => setMealForm({ ...mealForm, carbs: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Fat (g)</label>
                    <input 
                      type="number" 
                      placeholder="10"
                      value={mealForm.fat}
                      onChange={(e) => setMealForm({ ...mealForm, fat: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Description / Notes</label>
                  <textarea 
                    rows={3} 
                    placeholder="E.g., High-protein recovery meal post power session today..." 
                    value={mealForm.description}
                    onChange={(e) => setMealForm({ ...mealForm, description: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none"
                  />
                </div>

                <Button type="submit" disabled={uploading} className="bg-black hover:bg-gray-800 text-white font-bold rounded-xl w-full py-3">
                  {uploading ? "Posting..." : "Share to Daily Feed"}
                </Button>
              </form>
            </Card>
          ) : (
            // CREATE RECIPE FORM
            <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Add Cookbook Recipe</h2>
                <p className="text-xs text-gray-500 mt-0.5">Publish detailed nutritional recipes for client dashboards.</p>
              </div>

              <form onSubmit={handleRecipeSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Recipe Title</label>
                    <input 
                      type="text" 
                      placeholder="High-Protein Power Oats" 
                      value={recipeForm.title}
                      onChange={(e) => setRecipeForm({ ...recipeForm, title: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Category</label>
                    <select 
                      value={recipeForm.category}
                      onChange={(e) => setRecipeForm({ ...recipeForm, category: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snack</option>
                      <option value="smoothie">Smoothie</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Prep Time</label>
                    <input 
                      type="text" 
                      placeholder="15 mins" 
                      value={recipeForm.prep_time}
                      onChange={(e) => setRecipeForm({ ...recipeForm, prep_time: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-2 py-2 text-xs text-gray-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Calories</label>
                    <input 
                      type="number" 
                      placeholder="380" 
                      value={recipeForm.calories}
                      onChange={(e) => setRecipeForm({ ...recipeForm, calories: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-2 py-2 text-xs text-gray-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Protein (g)</label>
                    <input 
                      type="number" 
                      placeholder="25" 
                      value={recipeForm.protein}
                      onChange={(e) => setRecipeForm({ ...recipeForm, protein: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-2 py-2 text-xs text-gray-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Carbs (g)</label>
                    <input 
                      type="number" 
                      placeholder="40" 
                      value={recipeForm.carbs}
                      onChange={(e) => setRecipeForm({ ...recipeForm, carbs: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-2 py-2 text-xs text-gray-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Fat (g)</label>
                    <input 
                      type="number" 
                      placeholder="8" 
                      value={recipeForm.fat}
                      onChange={(e) => setRecipeForm({ ...recipeForm, fat: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-2 py-2 text-xs text-gray-900 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Image Upload Picker for recipe */}
                <ImageUploadPicker
                  value={recipeForm.image_url}
                  onChange={(url) => setRecipeForm({ ...recipeForm, image_url: url })}
                  bucket="nutrition-images"
                  label="Recipe Photo (optional)"
                />

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Short Description</label>
                  <input 
                    type="text" 
                    placeholder="Flavors, macro highlights, or recovery benefits..." 
                    value={recipeForm.description}
                    onChange={(e) => setRecipeForm({ ...recipeForm, description: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Ingredients (one per line)</label>
                    <textarea 
                      rows={4} 
                      placeholder={"1 cup dry oats\n1 scoop protein powder\n1 tbsp peanut butter"} 
                      value={recipeForm.ingredients}
                      onChange={(e) => setRecipeForm({ ...recipeForm, ingredients: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-900 font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Instructions (one per line)</label>
                    <textarea 
                      rows={4} 
                      placeholder={"Cook oats in boiling water for 5 minutes.\nStir in protein powder.\nTop with peanut butter and fruit."} 
                      value={recipeForm.instructions}
                      onChange={(e) => setRecipeForm({ ...recipeForm, instructions: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-900 font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={uploading} className="bg-black hover:bg-gray-800 text-white font-bold rounded-xl w-full py-3">
                  {uploading ? "Creating..." : "Publish Cookbook Recipe"}
                </Button>
              </form>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN: LIST ITEMS */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
            <h3 className="text-md font-bold text-[#081C15] mb-4 flex items-center justify-between">
              <span>Recent Submissions ({activeTab === "meals" ? "Meals" : "Recipes"})</span>
              <button 
                onClick={fetchAdminData}
                className="text-[10px] text-gray-500 hover:text-black font-semibold underline"
              >
                Refresh List
              </button>
            </h3>

            {loadingLists ? (
              <div className="py-12 text-center text-gray-400 text-sm">Loading submissions...</div>
            ) : activeTab === "meals" ? (
              recentMeals.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-xs">No daily meals logged in database yet.</div>
              ) : (
                <div className="space-y-3">
                  {recentMeals.map((meal) => (
                    <div key={meal.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200/50 justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0 border border-gray-300/50">
                          <img src={meal.image_url} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 capitalize">{meal.meal_type}</p>
                          <p className="text-[11px] text-gray-500 truncate max-w-[150px]">{meal.description}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteMeal(meal.id)}
                        className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )
            ) : (
              recentRecipes.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-xs">No cookbook recipes in database yet.</div>
              ) : (
                <div className="space-y-3">
                  {recentRecipes.map((recipe) => (
                    <div key={recipe.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200/50 justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0 border border-gray-300/50">
                          <img src={recipe.image_url} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate max-w-[150px]">{recipe.title}</p>
                          <p className="text-[10px] text-gray-500 capitalize flex items-center gap-2 mt-0.5">
                            <span>{recipe.category}</span>
                            <span>•</span>
                            <span>{recipe.prep_time}</span>
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteRecipe(recipe.id)}
                        className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )
            )}
          </Card>
        </div>

      </div>
    </div>
  );
}
