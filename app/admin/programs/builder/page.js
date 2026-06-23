import React from 'react';
import { createAdminClient } from "@/supabase/server";
import BuilderForm from './BuilderForm';

export default async function ProgramBuilderPage({ searchParams }) {
  // Add await here if using Next.js 15+, for backwards compatibility we handle it properly
  const { id } = await searchParams;
  
  let initialData = {
    title: '',
    description: '',
    image_url: '',
    paystack_plan_code: '',
    is_active: true,
    steps: []
  };

  if (id) {
    const supabase = createAdminClient();
    
    // Fetch program
    const { data: program, error: programError } = await supabase
      .from('programs')
      .select('*')
      .eq('id', id)
      .single();

    if (!programError && program) {
      initialData = { ...initialData, ...program, steps: [] };

      // Fetch steps
      const { data: steps } = await supabase
        .from('form_steps')
        .select('*')
        .eq('program_id', id)
        .order('order', { ascending: true });

      if (steps && steps.length > 0) {
        // Fetch questions for these steps
        const stepIds = steps.map(s => s.id);
        const { data: questions } = await supabase
          .from('form_questions')
          .select('*')
          .in('step_id', stepIds)
          .order('order', { ascending: true });

        // Assemble the nested structure
        initialData.steps = steps.map(step => ({
          ...step,
          questions: (questions || []).filter(q => q.step_id === step.id)
        }));
      }
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto w-full animate-in fade-in-0 duration-500 pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          {id ? 'Edit Program' : 'Create New Program'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure the program details, pricing, and onboarding form.
        </p>
      </div>

      <BuilderForm initialData={initialData} programId={id} />
    </div>
  );
}
