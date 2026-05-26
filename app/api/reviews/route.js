import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

export async function POST(request) {
    try {
        const supabase = await createClient();
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { program_id, rating, review_text } = body;

        if (!program_id || !rating) {
            return NextResponse.json({ error: 'Program ID and rating are required' }, { status: 400 });
        }

        // Upsert the review into the database. 
        // Supabase RLS will automatically reject this if the user doesn't have an entry in program_access.
        const { error } = await supabase
            .from('program_reviews')
            .upsert({
                program_id,
                user_id: user.id,
                rating,
                review_text,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id, program_id' // Uses the unique constraint we defined
            });

        if (error) {
            console.error("Supabase review error:", error);
            
            // Handle RLS violation error explicitly for a better user message
            if (error.code === '42501' || error.message?.includes('violates row-level security')) {
                 return NextResponse.json({ error: 'You must purchase this program to leave a review.' }, { status: 403 });
            }

            return NextResponse.json({ error: error.message || 'Failed to submit review' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Reviews API error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
