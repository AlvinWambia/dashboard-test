import { client } from "@/lib/sanity";
import HomeClient from "./home2/HomeClient";
import { Suspense } from "react";
import { createAdminClient } from "@/supabase/server";

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
        const [sanityData, supabaseClient] = await Promise.all([
            client.fetch(query),
            Promise.resolve(createAdminClient())
        ]);
        
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
            faqs: p.faqs || []
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
            image: p.image_url
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
    const { products, programs, testimonials, about, loungewear } = await getData();
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <HomeClient products={products} programs={programs} testimonials={testimonials} about={about} loungewear={loungewear} />
        </Suspense>
    );
}