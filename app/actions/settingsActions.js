"use server";

import { createAdminClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";

export async function getConsultationSettings() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("consultation_settings")
      .select("*")
      .eq("id", "default")
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching consultation settings:", error);
    }

    return {
      booking_url: data?.booking_url || "",
      admin_email: data?.admin_email || "",
      admin_whatsapp: data?.admin_whatsapp || "",
    };
  } catch (err) {
    console.error("Failed to get consultation settings:", err);
    return { booking_url: "", admin_email: "", admin_whatsapp: "" };
  }
}

export async function updateConsultationSettings(formData) {
  try {
    const supabase = createAdminClient();
    const payload = {
      id: "default",
      booking_url: formData.booking_url ? formData.booking_url.trim() : null,
      admin_email: formData.admin_email ? formData.admin_email.trim() : null,
      admin_whatsapp: formData.admin_whatsapp ? formData.admin_whatsapp.trim() : null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("consultation_settings")
      .upsert(payload, { onConflict: "id" });

    if (error) {
      console.error("Error updating consultation settings:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/settings");
    revalidatePath("/profile");
    return { success: true };
  } catch (err) {
    console.error("Failed to update consultation settings:", err);
    return { success: false, error: err.message };
  }
}
