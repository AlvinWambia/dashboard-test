import WellnessClient from "./WellnessClient";
import { createClient } from "@/supabase/server";

export const metadata = {
  title: "Wellness | myFit",
  description: "Mindfulness, Fitness, and Motivation.",
};

export default async function WellnessPage() {
  const supabase = await createClient();

  // Fetch settings for affirmation quote
  const { data: settingsData } = await supabase
    .from("wellness_settings")
    .select("affirmation_quote")
    .eq("id", 1)
    .single();

  // Fetch wellness posts
  const { data: postsData } = await supabase
    .from("wellness_posts")
    .select("*")
    .order("created_at", { ascending: false });

  const affirmation = settingsData?.affirmation_quote || "Take a deep breath. You are capable of amazing things.";
  const posts = postsData || [];

  return (
    <WellnessClient 
      initialAffirmation={affirmation} 
      initialPosts={posts} 
      dbConnected={!!postsData}
    />
  );
}
