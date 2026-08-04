import { createAdminClient } from "@/supabase/server";
import { notFound } from "next/navigation";
import ClientDetailView from "./ClientDetailView";

export default async function ClientProfilePage({ params }) {
  const { id } = await params;
  const supabase = createAdminClient();

  // Fetch client intake form
  const { data: clientData, error: clientError } = await supabase
    .from('client_intake_forms')
    .select('*')
    .eq('id', id)
    .single();

  if (clientError || !clientData) {
    console.error("Error fetching client:", clientError?.message || clientError);
    notFound();
  }

  let client = { ...clientData, orders: null };

  const userId = clientData.user_id;

  // 1. Fetch order / program name
  if (clientData.order_id) {
    const { data: order } = await supabase
      .from('orders')
      .select('program_name, created_at, status')
      .eq('id', clientData.order_id)
      .single();
    
    if (order) {
      client.orders = order;
    }
  }

  // Fallback program lookup if order_id was empty or missing
  if (!client.orders && userId) {
    const { data: latestOrder } = await supabase
      .from('orders')
      .select('program_name, created_at, status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestOrder) {
      client.orders = latestOrder;
    } else {
      const { data: clientProg } = await supabase
        .from('client_programs')
        .select('programs(title)')
        .eq('client_id', userId)
        .limit(1)
        .maybeSingle();

      if (clientProg?.programs?.title) {
        client.orders = { program_name: clientProg.programs.title };
      }
    }
  }

  // Fetch notes
  const { data: notes, error: notesError } = await supabase
    .from('client_notes')
    .select('*')
    .eq('client_form_id', id)
    .order('created_at', { ascending: false });

  if (notesError) {
    console.error("Error fetching notes:", notesError.message || notesError);
  }

  // Fetch subscription (query by user_id first, fallback to form id)
  const targetId = userId || id;
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('client_id', targetId)
    .maybeSingle();

  if (subscription) {
    client.subscription = subscription;
  }

  // Fetch payment history
  const { data: payments } = await supabase
    .from('payment_history')
    .select('*')
    .eq('client_id', targetId)
    .order('paid_at', { ascending: false });

  return (
    <ClientDetailView client={client} initialNotes={notes || []} paymentHistory={payments || []} />
  );
}
