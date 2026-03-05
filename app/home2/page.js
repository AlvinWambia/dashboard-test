import { client } from "@/lib/sanity";
import HomeClient from "./HomeClient"; // We'll create this next

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
        }
    }`;
    console.log("Attempting to fetch data from Sanity...");
    try {
        const data = await client.fetch(query);
        console.log(`Successfully fetched data.`);
        return data;
    } catch (error) {
        console.error("Error fetching data from Sanity:", error);
        return { products: [], programs: [], testimonials: [] };
    }
}

export default async function MyFitLandingPage() {
    const { products, programs, testimonials } = await getData();
    return <HomeClient products={products} programs={programs} testimonials={testimonials} />;
}