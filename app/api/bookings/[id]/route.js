import { createAdminClient } from "@/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, unlocked_purchase } = body;

    const supabaseAdmin = createAdminClient();

    const updateData = {
      updated_at: new Date().toISOString(),
    };

    if (status !== undefined) updateData.status = status;
    if (unlocked_purchase !== undefined) updateData.unlocked_purchase = unlocked_purchase;

    const { data: updatedBooking, error } = await supabaseAdmin
      .from("bookings")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Database Error updating booking:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (err) {
    console.error("API PATCH /api/bookings/[id] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
