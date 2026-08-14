import { createAdminClient, createClient } from "@/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      program_id,
      user_id,
      notes,
      consultation_paid,
      consultation_payment_ref,
      customer_email,
      customer_name,
      customer_phone,
      parent_booking_id,
      consultation_round,
    } = body;

    if (!program_id) {
      return NextResponse.json({ error: "program_id is required" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // If user_id wasn't passed directly, attempt to find user by email
    let finalUserId = user_id;
    if (!finalUserId && customer_email) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("email", customer_email)
        .maybeSingle();

      if (profile) {
        finalUserId = profile.id;
      }
    }

    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .insert([
        {
          program_id,
          user_id: finalUserId || null,
          notes: notes || null,
          consultation_paid: !!consultation_paid,
          consultation_payment_ref: consultation_payment_ref || null,
          status: "pending",
          unlocked_purchase: false,
          customer_phone: customer_phone || null,
          parent_booking_id: parent_booking_id || null,
          consultation_round: consultation_round || 1,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Database Error creating booking:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, booking });
  } catch (err) {
    console.error("API POST /api/bookings Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const supabaseAdmin = createAdminClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    let query = supabaseAdmin
      .from("bookings")
      .select(`
        *,
        programs (
          id,
          title,
          price,
          consultation_fee,
          service_type,
          image_url
        ),
        profiles (
          id,
          full_name,
          email,
          phone
        )
    `);
    
    if (userId) {
      query = query.eq("user_id", userId);
    }
    
    const { data: bookings, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Database Error fetching bookings:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, bookings });
  } catch (err) {
    console.error("API GET /api/bookings Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
