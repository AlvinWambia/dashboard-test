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
            full_name: fullName,
            role: profile?.role || user.user_metadata?.role || 'user'
        };
    } catch (e) {
        console.error("Error getting initial user:", e);
        return null;
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
            price: p.price || 0
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
            consultation_fee: p.consultation_fee || 0
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
    const [initialProfile, { products, programs, testimonials, about, loungewear }] = await Promise.all([
        getInitialUser(),
        getData()
    ]);

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <HomeClient 
                initialProfile={initialProfile}
                products={products} 
                programs={programs} 
                testimonials={testimonials} 
                about={about} 
                loungewear={loungewear} 
            />
        </Suspense>
    );
}