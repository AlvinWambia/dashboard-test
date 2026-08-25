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

  // Fetch payment history from three sources in parallel:
  // 1. payment_history — subscription payments recorded by webhook
  // 2. payments — one-time program payments recorded by webhook
  // 3. bookings — consultation payments (stored with consultation_payment_ref)
  const [{ data: paymentsHistory }, { data: oneTimePayments }, { data: consultationBookings }] = await Promise.all([
    supabase
      .from('payment_history')
      .select('*')
      .eq('client_id', targetId)
      .order('paid_at', { ascending: false }),

    (userId || clientData.order_id) ? supabase
      .from('payments')
      .select('*, orders(program_name)')
      .or(
        [
          userId ? `user_id.eq.${userId}` : null,
          clientData.order_id ? `order_id.eq.${clientData.order_id}` : null
        ].filter(Boolean).join(',')
      )
      .order('created_at', { ascending: false }) : { data: [] },

    supabase
      .from('bookings')
      .select(`
        id,
        consultation_payment_ref,
        consultation_paid,
        created_at,
        programs ( title, consultation_fee )
      `)
      .eq('consultation_paid', true)
      .or(
        userId
          ? `user_id.eq.${userId}`
          : `customer_email.eq.${clientData.email}`
      )
      .order('created_at', { ascending: false }),
  ]);

  // Normalise consultation bookings into the same shape as payment_history rows
  const consultationPaymentsList = (consultationBookings || []).map((b) => ({
    id: `booking_${b.id}`,
    client_id: targetId,
    amount: b.programs?.consultation_fee ?? 0,
    currency: 'KES',
    status: 'success',
    reference: b.consultation_payment_ref || `BOOK-${b.id}`,
    paid_at: b.created_at,
    type: 'consultation',
    program_title: b.programs?.title || 'Consultation',
  }));

  const oneTimePaymentsList = (oneTimePayments || []).map((p) => ({
    id: `payment_${p.id}`,
    client_id: p.user_id,
    amount: p.amount,
    currency: p.currency || 'KES',
    status: p.status,
    reference: p.provider_payment_id || `PAY-${p.id}`,
    paid_at: p.created_at,
    type: 'one-time',
    program_title: p.orders?.program_name || 'Program Purchase',
  }));

  // Merge and sort all payments newest-first
  const allPayments = [
    ...(paymentsHistory || []).map((p) => ({ ...p, type: p.type || 'subscription' })),
    ...oneTimePaymentsList,
    ...consultationPaymentsList,
  ].sort((a, b) => new Date(b.paid_at) - new Date(a.paid_at));

  return (
    <ClientDetailView client={client} initialNotes={notes || []} paymentHistory={allPayments} />
  );
}
