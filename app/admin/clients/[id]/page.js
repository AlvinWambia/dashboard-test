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

  // Fetch notes
  const { data: notes, error: notesError } = await supabase
    .from('client_notes')
    .select('*')
    .eq('client_form_id', id)
    .order('created_at', { ascending: false });

  if (notesError) {
    console.error("Error fetching notes:", notesError.message || notesError);
  }

  // Fetch subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('client_id', id)
    .single();

  if (subscription) {
    client.subscription = subscription;
  }

  // Fetch payment history
  const { data: payments } = await supabase
    .from('payment_history')
    .select('*')
    .eq('client_id', id)
    .order('paid_at', { ascending: false });

  return (
    <ClientDetailView client={client} initialNotes={notes || []} paymentHistory={payments || []} />
  );
}
