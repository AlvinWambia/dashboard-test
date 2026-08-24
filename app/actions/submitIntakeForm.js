'use server';

import { createClient } from '@/supabase/server';
import { redirect } from 'next/navigation';

export async function submitIntakeForm(formData, orderId) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Your session has expired. Please log in again.' };
  }

  const insertData = {
    user_id: user.id,
    order_id: orderId || null,
    full_name: formData.fullName,
    email: formData.email,
    phone_number: formData.phoneNumber,
    birth_date: formData.birthDate,
    gender: formData.gender,
    current_weight: formData.currentWeight,
    height: formData.height,
    training_level: formData.trainingLevel,
    activity_level: formData.activityLevel,
    goal: formData.goal,
    target_weight: formData.goal === 'lose-weight' ? (formData.targetWeight || null) : null,
    goal_description: formData.goalDescription,
    injuries: formData.injuries,
    medical_conditions: formData.medicalConditions,
  };

  const { error } = await supabase.from('client_intake_forms').insert(insertData);

  if (error) {
    console.error('Intake form insert error:', error);
    return { error: error.message || 'Failed to save your form. Please try again.' };
  }

  // Redirect server-side (this throws a NEXT_REDIRECT internally, which is expected)
  if (orderId) {
    redirect(`/checkout/${orderId}`);
  } else {
    redirect('/?form_submitted=true');
  }
}
