import { createClient } from "@/supabase/server";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(req) {
  const rateLimitError = checkRateLimit(req, {
    limit: 10,
    windowMs: 15 * 60 * 1000,
    keyPrefix: "prog-remove",
  });
  if (rateLimitError) return rateLimitError;

  try {
    const supabase = await createClient();
    
    // 1. Verify Authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { program_id } = body;

    if (!program_id) {
      return NextResponse.json({ error: "Program ID is required" }, { status: 400 });
    }

    // 2. Delete the client_program record for this user
    // We only delete the user's specific access to this program
    const { error: deleteError } = await supabase
      .from("client_programs")
      .delete()
      .eq('client_id', user.id)
      .eq('program_id', program_id);

    if (deleteError) {
      console.error("Error deleting program from dashboard:", deleteError);
      return NextResponse.json({ error: "Failed to remove program from dashboard" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Program removed successfully" });
  } catch (error) {
    console.error("Remove program error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
