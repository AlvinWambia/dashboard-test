import { createAdminClient } from "@/supabase/server";
import BookingsClient from "./BookingsClient";

export default async function AdminBookingsPage() {
  const supabaseAdmin = createAdminClient();

  // Fetch bookings, programs, and client profiles
  const { data: bookings, error } = await supabaseAdmin
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
        full_name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(
      "[Admin Bookings] Supabase fetch error:",
      JSON.stringify(error, null, 2)
    );

    return <BookingsClient initialBookings={[]} />;
  }

  // Fetch users from Supabase Auth
  const {
    data: { users },
    error: usersError,
  } = await supabaseAdmin.auth.admin.listUsers();

  if (usersError) {
    console.error(
      "[Admin Bookings] Auth users fetch error:",
      JSON.stringify(usersError, null, 2)
    );

    return <BookingsClient initialBookings={bookings || []} />;
  }

  // Create a user ID → email lookup
  const emailMap = new Map(
    users.map((user) => [user.id, user.email])
  );

  // Add email to each booking's profile
  const bookingsWithClientInfo = (bookings || []).map((booking) => ({
    ...booking,

    profiles: booking.profiles
      ? {
        ...booking.profiles,
        email: emailMap.get(booking.profiles.id) || null,
      }
      : null,
  }));

  return (
    <BookingsClient initialBookings={bookingsWithClientInfo} />
  );
}