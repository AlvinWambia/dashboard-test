import { createClient as createSanityClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import '@dotenvx/dotenvx/config'; // Use dotenvx to load .env file

// --- 1. Environment Variable Validation ---
const {
  NEXT_PUBLIC_SANITY_PROJECT_ID,
  NEXT_PUBLIC_SANITY_DATASET,
  SANITY_API_TOKEN, // A read-only token is sufficient
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY, // Use the service_role key for admin access
} = process.env;

const requiredEnv = {
  NEXT_PUBLIC_SANITY_PROJECT_ID,
  NEXT_PUBLIC_SANITY_DATASET,
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
};

for (const [key, value] of Object.entries(requiredEnv)) {
  if (!value) {
    console.error(`Error: Missing required environment variable ${key}.`);
    process.exit(1);
  }
}

// --- 2. Client Initialization ---
const sanityClient = createSanityClient({
  projectId: NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-05-01', // Use a recent API version
  token: SANITY_API_TOKEN, // Recommended for server-side fetching
  useCdn: false, // `false` ensures we get the freshest data
});

const urlBuilder = imageUrlBuilder(sanityClient);

const supabaseClient = createSupabaseClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false, // This script is for backend use
  },
});

// Helper to get a full image URL from a Sanity image reference
function getImageUrl(source) {
  if (!source || !source.asset) {
    return null;
  }
  return urlBuilder.image(source).url();
}

// --- 3. Main Synchronization Logic ---
async function syncSanityToSupabase() {
  console.log('🚀 Starting synchronization from Sanity.io to Supabase...');
  let insertedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  try {
    // --- Fetch all products from Sanity ---
    const sanityQuery = `*[_type == "product"]{
      _id,
      name,
      productId,
      price,
      desc,
      image
    }`;
    console.log('Fetching products from Sanity.io...');
    const sanityProducts = await sanityClient.fetch(sanityQuery);

    if (!sanityProducts || sanityProducts.length === 0) {
      console.log('No products found in Sanity. Nothing to sync.');
      return;
    }
    console.log(`Found ${sanityProducts.length} products in Sanity.`);

    // --- Fetch existing program IDs from Supabase for accurate logging ---
    const { data: existingPrograms, error: fetchIdsError } = await supabaseClient
      .from('programs')
      .select('id');

    if (fetchIdsError) {
      throw new Error(`Error fetching existing programs from Supabase: ${fetchIdsError.message}`);
    }
    const existingIds = new Set(existingPrograms.map(p => p.id));

    // --- Map Sanity data to Supabase format ---
    const supabasePrograms = [];
    for (const p of sanityProducts) {
      // Use `productId` if it exists, otherwise fall back to `_id`.
      const programId = p.productId || p._id;
      if (!programId || !p.name) {
        console.warn(`Skipping product with missing ID or name: ${JSON.stringify(p)}`);
        skippedCount++;
        continue;
      }

      supabasePrograms.push({
        id: programId,
        name: p.name,
        price: p.price ?? 0,
        description: p.desc,
        image_url: getImageUrl(p.image),
        // Note: 'rating' and 'reviews' are not in the 'programs' table schema and were removed.
      });

      existingIds.has(programId) ? updatedCount++ : insertedCount++;
    }

    // --- Perform a single bulk upsert operation ---
    console.log(`Upserting ${supabasePrograms.length} programs to Supabase...`);
    const { error: upsertError } = await supabaseClient
      .from('programs')
      .upsert(supabasePrograms, { onConflict: 'id' });

    if (upsertError) {
      throw new Error(`Supabase upsert failed: ${upsertError.message}`);
    }

    console.log('\n--- 🏁 Sync Summary ---');
    console.log(`✅ Successfully inserted: ${insertedCount} records.`);
    console.log(`🔄 Successfully updated: ${updatedCount} records.`);
    console.log(`⏭️  Skipped: ${skippedCount} records.`);
    console.log('Synchronization complete.');
  } catch (error) {
    console.error('\nAn unexpected error occurred during the sync process:', error.message);
    process.exit(1);
  }
}

// --- Run the script ---
syncSanityToSupabase();