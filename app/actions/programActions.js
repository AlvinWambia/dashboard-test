"use server";

import { createAdminClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export async function saveProgram(programId, data) {
  try {
    const supabase = createAdminClient();
    
    const programPrice = data.price ? parseFloat(data.price) : 0;
    const paymentType = data.payment_type || 'subscription';
    const isOneTime = paymentType === 'one_time';

    // For one-time programs, we don't use Paystack plans (plans are for recurring billing).
    // For subscription programs, auto-create or re-create the Paystack plan as needed.
    let paystackPlanCode = isOneTime ? null : (data.paystack_plan_code || null);
    const billingInterval = isOneTime ? null : (data.billing_interval || 'monthly');

    if (!isOneTime) {
      // If the admin changed the billing interval on an existing subscription program that
      // already has a plan, we must create a NEW Paystack plan (Paystack does not allow
      // updating an existing plan's interval). The old plan_code is cleared so a new one
      // is generated below.
      const intervalChanged = programId && data.original_billing_interval &&
        (data.billing_interval || 'monthly') !== data.original_billing_interval;
      if (intervalChanged) {
        paystackPlanCode = null; // force new plan creation
      }

      // Auto-create Paystack Plan if missing and price > 0
      if (!paystackPlanCode && programPrice > 0 && process.env.PAYSTACK_SECRET_KEY) {
        try {
          const planRes = await fetch('https://api.paystack.co/plan', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: data.title,
              interval: data.billing_interval || 'monthly',
              amount: Math.round(programPrice * 100), // Convert to kobo/cents
              currency: 'KES'
            })
          });
          const planData = await planRes.json();
          if (planData.status && planData.data && planData.data.plan_code) {
            paystackPlanCode = planData.data.plan_code;
          } else {
            console.error("Paystack Plan Creation Failed:", planData.message);
          }
        } catch (err) {
          console.error("Error creating Paystack plan:", err);
        }
      }
    }

    // 1. Upsert Program
    const programData = {
      title: data.title,
      name: data.title, // Map name to title for database schema constraint and legacy compatibility
      description: data.description,
      image_url: data.image_url,
      payment_type: paymentType,
      paystack_plan_code: paystackPlanCode,
      billing_interval: billingInterval,
      price: programPrice,
      faqs: data.faqs || [],
      is_active: data.is_active,
      has_digital_downloads: data.has_digital_downloads || false,
      has_dashboard_access: data.has_dashboard_access || false,
      has_online_consultations: (data.has_online_one_on_one || data.has_online_group || data.has_online_consultations) || false,
      has_online_one_on_one: data.has_online_one_on_one || false,
      has_online_group: data.has_online_group || false,
      has_physical_sessions: data.has_physical_sessions || false,
      booking_url: data.booking_url || null,
      location_details: data.location_details || null,
      service_type: data.service_type || 'downloadable',
      consultation_fee: data.consultation_fee ? parseFloat(data.consultation_fee) : 0,
      followup_fee: data.followup_fee ? parseFloat(data.followup_fee) : 0,
    };

    let pId = programId;

    if (pId) {
      const { error } = await supabase
        .from('programs')
        .update(programData)
        .eq('id', pId);
      if (error) throw new Error("Failed to update program: " + error.message);
    } else {
      // Generate a new UUID client/server side since the DB lacks a default uuid generator
      const newId = randomUUID();
      const insertData = { ...programData, id: newId };
      const { data: newProgram, error } = await supabase
        .from('programs')
        .insert([insertData])
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
    revalidatePath('/');
    return { success: true, id: pId };

  } catch (error) {
    console.error("Save Program Error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteProgram(programId) {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from('programs')
      .delete()
      .eq('id', programId);

    if (error) throw new Error("Failed to delete program: " + error.message);

    revalidatePath('/admin/programs');
    return { success: true };
  } catch (error) {
    console.error("Delete Program Error:", error);
    return { success: false, error: error.message };
  }
}


