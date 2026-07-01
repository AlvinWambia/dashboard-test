import { createAdminClient } from "@/supabase/server";
import NutritionClient from "./NutritionClient";


export const revalidate = 0; // Fetch dynamic data on every request

export default async function NutritionPage() {
    let initialRecipes = [];
    let initialMeals = [];
    let dbConnected = true;

    try {
        const supabase = createAdminClient();

        // Fetch recipes
        const { data: recipes, error: recipesError } = await supabase
            .from('recipes')
            .select('*')
            .order('created_at', { ascending: false });

        if (recipesError) {
            console.warn("Could not fetch recipes from Supabase (maybe table doesn't exist yet):", recipesError);
            dbConnected = false;
        } else {
            initialRecipes = recipes || [];
        }

        // Fetch daily meals
        const { data: meals, error: mealsError } = await supabase
            .from('daily_meals')
            .select('*')
            .order('posted_at', { ascending: false });

        if (mealsError) {
            console.warn("Could not fetch daily meals from Supabase (maybe table doesn't exist yet):", mealsError);
            dbConnected = false;
        } else {
            initialMeals = meals || [];
        }

    } catch (e) {
        console.error("Supabase connection error in nutrition server page:", e);
        dbConnected = false;
    }

    return (
        <NutritionClient
            initialRecipes={initialRecipes}
            initialMeals={initialMeals}
            dbConnected={dbConnected}
        />
    );
}
