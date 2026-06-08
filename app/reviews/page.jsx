import { createClient } from "@/supabase/server";
import ReviewsClient from "./ReviewsClient";

export default async function ReviewsPage() {
  const supabase = await createClient();

  // Fetch verified reviews from the database
  const { data: dbReviews, error } = await supabase
    .from('program_reviews')
    .select(`
        id,
        rating,
        review_text,
        created_at,
        profiles (
            full_name,
            avatar_url
        ),
        programs (
            name
        )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching reviews:", error);
  }

  return (
    <ReviewsClient dbReviews={dbReviews || []} />
  );
}
