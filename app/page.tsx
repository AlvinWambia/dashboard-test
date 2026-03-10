import { client } from "@/lib/sanity";
import HomeClient from "./home2/HomeClient";
import { Suspense } from "react";

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
        "programs": *[_type == "program"]{
            _id,
            title,
            description,
            image,
            faqs[] {
                question,
                answer
            }
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
        }
    }`;
    console.log("Attempting to fetch data from Sanity...");
    try {
        const data = await client.fetch(query);
        console.log(`Successfully fetched data.`);
        return data;
    } catch (error) {
        console.error("Error fetching data from Sanity:", error);
        return { products: [], programs: [], testimonials: [], about: [] };
    }
}

export default async function MyFitLandingPage() {
    const { products, programs, testimonials, about } = await getData();
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <HomeClient products={products} programs={programs} testimonials={testimonials} about={about} />
        </Suspense>
    );
}