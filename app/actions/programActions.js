"use server";

import { createAdminClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveProgram(programId, data) {
  try {
    const supabase = createAdminClient();
    
    // 1. Upsert Program
    const programData = {
      title: data.title,
      description: data.description,
      image_url: data.image_url,
      paystack_plan_code: data.paystack_plan_code,
      price: data.price ? parseFloat(data.price) : 0,
      faqs: data.faqs || [],
      is_active: data.is_active,
      has_digital_downloads: data.has_digital_downloads || false,
      has_dashboard_access: data.has_dashboard_access || false,
      has_online_consultations: data.has_online_consultations || false,
      has_physical_sessions: data.has_physical_sessions || false,
      booking_url: data.booking_url || null,
      location_details: data.location_details || null,
    };

    let pId = programId;

    if (pId) {
      const { error } = await supabase
        .from('programs')
        .update(programData)
        .eq('id', pId);
      if (error) throw new Error("Failed to update program: " + error.message);
    } else {
      const { data: newProgram, error } = await supabase
        .from('programs')
        .insert([programData])
        .select()
        .single();
      if (error) throw new Error("Failed to create program: " + error.message);
      pId = newProgram.id;
    }

    // Save Assets
    if (data.assets) {
      // Delete existing assets
      await supabase.from('program_assets').delete().eq('program_id', pId);
      
      // Insert new assets
      if (data.assets.length > 0) {
        const assetsData = data.assets.map(asset => ({
          program_id: pId,
          file_name: asset.file_name,
          file_url: asset.file_url,
          file_type: asset.file_type
        }));
        
        const { error: assetsError } = await supabase
          .from('program_assets')
          .insert(assetsData);
          
        if (assetsError) {
          console.error("Failed to save program assets:", assetsError);
          // Non-fatal error, but should log it
        }
      }
    }

    revalidatePath('/admin/programs');
    return { success: true, id: pId };

  } catch (error) {
    console.error("Save Program Error:", error);
    return { success: false, error: error.message };
  }
}
