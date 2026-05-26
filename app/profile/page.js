import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
    const supabase = await createClient();

    // 1. Get the authenticated user from the session
    const { data: { user } } = await supabase.auth.getUser();

    // 2. If no user exists, send them to login
    if (!user) {
        redirect("/auth/login");
    }

    // 3. Fetch the profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // 4. Fetch the programs they have access to
    const { data: accessData } = await supabase
        .from('program_access')
        .select(`
            *,
            programs (
                id,
                name,
                description,
                image_url
            )
        `)
        .eq('user_id', user.id);

    // Extract the programs from the access table
    const purchasedPrograms = accessData?.map(access => ({
        ...access.programs,
        access_id: access.id,
        granted_at: access.granted_at,
    })) || [];

    // 5. Fetch their existing reviews
    const { data: reviewsData } = await supabase
        .from('program_reviews')
        .select('*')
        .eq('user_id', user.id);

    const reviews = reviewsData || [];

    return (
        <ProfileClient profile={profile} user={user} purchasedPrograms={purchasedPrograms} reviews={reviews} />
    );
}
