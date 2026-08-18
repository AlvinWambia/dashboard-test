import { client } from "@/lib/sanity";
import HomeClient from "./home2/HomeClient";
import { Suspense } from "react";
import { createClient, createAdminClient } from "@/supabase/server";

export const dynamic = 'force-dynamic';

async function getInitialUser() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', user.id)
            .maybeSingle();

        const fullName = profile?.full_name
            || user.user_metadata?.full_name
            || user.user_metadata?.name
            || user.email?.split('@')[0]
            || "Member";

        return {
            ...profile,
            id: user.id,
            email: user.email,
            full_name: fullName,
            role: profile?.role || user.user_metadata?.role || 'user'
        };
    } catch (e) {
        console.error("Error getting initial user:", e);
        return null;
    }
}

async function getUserBookings(user: any) {
    if (!user) return [];
    try {
        const supabase = await createClient();
        let query = supabase.from('bookings').select('program_id, consultation_paid, status, unlocked_purchase, created_at, id, consultation_round');
        if (user.email) {
            query = query.or(`user_id.eq.${user.id},customer_email.eq.${user.email}`);
        } else {
            query = query.eq('user_id', user.id);
        }
        const { data, error } = await query;
        if (!error && data) return data;
        return [];
    } catch (e) {
        console.error("Error getting user bookings:", e);
        return [];
    }
}

async function getPurchasedPrograms(user: any) {
    if (!user) return [];
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('client_programs')
            .select('program_id')
            .eq('client_id', user.id);
        if (!error && data) return data.map(d => ({ id: d.program_id }));
        return [];
    } catch (e) {
        console.error("Error getting purchased programs:", e);
        return [];
    }
}

async function getSubscriptions(user: any) {
    if (!user) return [];
    try {
        const supabase = await createClient();
        let query = supabase.from('subscriptions').select('*');
        if (user.email) {
            query = query.or(`user_id.eq.${user.id},customer_email.eq.${user.email}`);
        } else {
            query = query.eq('user_id', user.id);
        }
        const { data, error } = await query;
        if (!error && data) return data;
        return [];
    } catch (e) {
        console.error("Error getting subscriptions:", e);
        return [];
    }
}

async function getData() {
    // Fetch products and programs in one go
    const query = `{
        "products": *[_type == "product"]{
            _id,
            name,
            price,
            desc,
            rating,
            reviews,
            image
        },
        "testimonials": *[_type == "testimonials"]{
            name,
            role,
            desc
        },
        "about": *[_type == "about"]{
        name,
        desc,
        image
        },
        "loungewear": *[_type == "loungewear"]{
            _id,
            name,
            price,
            desc,
            image,
            link
        }
    }`;
    console.log("Attempting to fetch data from Sanity and Supabase...");
    try {
        const supabaseClient = createAdminClient();
        const sanityData = await client.fetch(query);
        
        // Fetch programs from Supabase
        const { data: supabasePrograms, error } = await supabaseClient
            .from('programs')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching programs from Supabase:", error);
        }

        // Map Supabase data to match the expected format for HomeClient programs
        const mappedPrograms = (supabasePrograms || []).map(p => ({
            _id: p.id,
            title: p.title,
            description: p.description,
            image: p.image_url,
            faqs: p.faqs || [],
            service_type: p.service_type || 'downloadable',
            consultation_fee: p.consultation_fee || 0,
            price: p.price || 0,
            has_digital_downloads: p.has_digital_downloads || false,
            has_online_consultations: p.has_online_consultations || false,
            has_online_one_on_one: p.has_online_one_on_one || (p.has_online_consultations && !p.has_online_group) || false,
            has_online_group: p.has_online_group || false,
            has_physical_sessions: p.has_physical_sessions || false,
        }));

        // Map Supabase data to match the expected format for HomeClient products
        // The user wants programs to display as products
        const mappedProducts = (supabasePrograms || []).map(p => ({
            _id: p.id,
            name: p.title,
            price: p.price || 0,
            desc: p.description,
            rating: 5, // Hardcoded for now to retain UI
            reviews: 12, // Hardcoded for now to retain UI
            image: p.image_url,
            service_type: p.service_type || 'downloadable',
            consultation_fee: p.consultation_fee || 0,
            has_digital_downloads: p.has_digital_downloads || false,
            has_online_consultations: p.has_online_consultations || false,
            has_online_one_on_one: p.has_online_one_on_one || (p.has_online_consultations && !p.has_online_group) || false,
            has_online_group: p.has_online_group || false,
            has_physical_sessions: p.has_physical_sessions || false,
        }));

        console.log(`Successfully fetched data.`);
        return {
            ...sanityData,
            programs: mappedPrograms,
            products: mappedProducts // Override sanity products with our mapped programs
        };
    } catch (error) {
        console.error("Error fetching data:", error);
        return { products: [], programs: [], testimonials: [], about: [], loungewear: [] };
    }
}

export default async function MyFitLandingPage() {
    const initialProfile = await getInitialUser();
    const [initialUserBookings, purchasedPrograms, subscriptions, { products, programs, testimonials, about, loungewear }] = await Promise.all([
        getUserBookings(initialProfile),
        getPurchasedPrograms(initialProfile),
        getSubscriptions(initialProfile),
        getData()
    ]);

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <HomeClient 
                initialProfile={initialProfile}
                initialUserBookings={initialUserBookings}
                purchasedPrograms={purchasedPrograms}
                subscriptions={subscriptions}
                products={products} 
                programs={programs} 
                testimonials={testimonials} 
                about={about} 
                loungewear={loungewear} 
            />
        </Suspense>
    );
}