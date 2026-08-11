import { createAdminClient } from "@/supabase/server";
import BookingsClient from "./BookingsClient";

export default async function AdminBookingsPage() {
  const supabaseAdmin = createAdminClient();

  const { data: bookings } = await supabaseAdmin
    .from("bookings")
    .select(`
      *,
      programs (
        id,
        title,
        price,
        consultation_fee,
        service_type
      ),
      profiles (
        id,
        full_name,
        email,
        phone
      )
    `)
    .order("created_at", { ascending: false });

  return <BookingsClient initialBookings={bookings || []} />;
}
