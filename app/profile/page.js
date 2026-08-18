import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function ProfilePage() {
    const supabase = await createClient();

    // 1. Get the authenticated user from the session
    const { data: { user } } = await supabase.auth.getUser();

    // 2. If no user exists, send them to login
    if (!user) {
        redirect("/auth/login");
    }

    let profile = null;
    let purchasedPrograms = [];
    let reviews = [];
    let subscriptions = [];
    let fetchError = null;

    try {
        // 3. Fetch the profile
        const { data: profileData, error: profileErr } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileErr && profileErr.code !== 'PGRST116') {
            console.error("Profile fetch error:", profileErr);
        }
        profile = profileData || { id: user.id, email: user.email, full_name: user.user_metadata?.full_name };

        // 4. Fetch global consultation settings for booking URL fallback
        const { data: globalSettings } = await supabase
            .from('consultation_settings')
            .select('booking_url')
            .eq('id', 'default')
            .maybeSingle();

        // 5. Fetch the programs they have access to
        const { data: accessData, error: accessErr } = await supabase
            .from('client_programs')
            .select(`
                *,
                programs (
                    id,
                    title,
                    description,
                    image_url,
                    has_digital_downloads,
                    has_dashboard_access,
                    has_online_consultations,
                    has_online_one_on_one,
                    has_online_group,
                    has_physical_sessions,
                    booking_url,
                    location_details,
                    paystack_plan_code,
                    consultation_fee,
                    followup_fee
                )
            `)
            .eq('client_id', user.id);

        if (accessErr) throw accessErr;

        // Item 3: Generate signed URLs for digital downloads
        if (accessData && accessData.length > 0) {
            purchasedPrograms = await Promise.all(accessData.map(async (access) => {
                const rawProg = access.programs;
                if (!rawProg) return null;
                const effectiveBookingUrl = rawProg.booking_url || globalSettings?.booking_url || '';
                const program = { ...rawProg, booking_url: effectiveBookingUrl };
                let assets = [];

                if (program.has_digital_downloads && program.id) {
                    const { data: programAssets } = await supabase
                        .from('program_assets')
                        .select('*')
                        .eq('program_id', program.id);

                    if (programAssets && programAssets.length > 0) {
                        assets = await Promise.all(programAssets.map(async (asset) => {
                            let signedUrl = asset.file_url;
                            if (asset.file_url) {
                                const { data: signedData } = await supabase.storage
                                    .from('program-documents')
                                    .createSignedUrl(asset.file_url, 3600);
                                if (signedData?.signedUrl) {
                                    signedUrl = signedData.signedUrl;
                                }
                            }
                            return { ...asset, signed_url: signedUrl };
                        }));
                    }
                }

                return {
                    ...program,
                    assets,
                    access_id: access.id,
                    granted_at: access.granted_at,
                    status: access.status,
                    review_status: access.review_status,
                };
            }));
        }

        // 5. Fetch their existing reviews
        const { data: reviewsData } = await supabase
            .from('program_reviews')
            .select('*')
            .eq('user_id', user.id);

        reviews = reviewsData || [];

        // 6. Fetch their active subscriptions for cancellation UX
        const { data: subscriptionsData } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('client_id', user.id)
            .in('status', ['active', 'non-renewing']);

        subscriptions = subscriptionsData || [];

        // 7. Fetch consultation bookings
        const { data: bookingsData } = await supabase
            .from('bookings')
            .select(`
                *,
                programs (
                    id,
                    title,
                    price,
                    consultation_fee,
                    followup_fee,
                    service_type,
                    image_url
                )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        var userBookings = bookingsData || [];

    } catch (err) {
        console.error("ProfilePage data fetch error:", err);
        fetchError = err.message || "Failed to load profile data";
    }

    return (
        <ProfileClient 
            profile={profile} 
            user={user} 
            purchasedPrograms={purchasedPrograms} 
            reviews={reviews} 
            subscriptions={subscriptions}
            userBookings={userBookings || []}
            fetchError={fetchError}
        />
    );
}
