import React from 'react';
import { createAdminClient } from "@/supabase/server";
import ProgramsListClient from './ProgramsListClient';

export default async function ProgramsPage() {
  const supabase = createAdminClient();
  
  // Fetch programs
  const { data: programsData, error: programsError } = await supabase
    .from('programs')
    .select('*')
    .order('created_at', { ascending: false });

  if (programsError) {
    console.error("Error fetching programs:", programsError.message || programsError);
  }

  // Fetch active subscriptions to count users per program
  const { data: subscriptionsData, error: subError } = await supabase
    .from('subscriptions')
    .select('plan_code, status')
    .eq('status', 'active');

  if (subError) {
    console.error("Error fetching subscriptions:", subError.message || subError);
  }

  let programs = programsData || [];

  // Calculate active subscribers per program
  if (subscriptionsData && subscriptionsData.length > 0) {
    const subscriberCounts = subscriptionsData.reduce((acc, sub) => {
      if (sub.plan_code) {
        acc[sub.plan_code] = (acc[sub.plan_code] || 0) + 1;
      }
      return acc;
    }, {});

    programs = programs.map(program => ({
      ...program,
      activeSubscribers: program.paystack_plan_code ? (subscriberCounts[program.paystack_plan_code] || 0) : 0
    }));
  } else {
    programs = programs.map(program => ({ ...program, activeSubscribers: 0 }));
  }

  return <ProgramsListClient initialPrograms={programs} />;
}
