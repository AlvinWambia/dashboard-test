'use server';

import { createClient } from '@/supabase/server';

import { redirect } from 'next/navigation';



export async function createOrder(productId) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // If the user is not logged in, redirect them to the login page.
    // We can add a query param to indicate why they were redirected.
    return redirect('/auth/login?message=Please log in to make a purchase.');
  }

  // It's crucial to verify the product and its price on the server-side
  // to prevent clients from tampering with the price.
  const { data: product, error: productError } = await supabase
    .from('programs')
    .select('price, name')
    .eq('id', productId)
    .single();

  if (productError || !product) {
    console.error('Error fetching program for order creation:', productError);
    // Redirect back to the home page with an error if the product isn't found.
    return redirect('/home2?error=product_not_found');
  }

  // Create a new order in the 'orders' table with a 'pending' status.
  const { data: newOrder, error: insertError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      program_id: productId,
      program_name: product.name, // Use the server-verified name
      price: product.price, // Use the server-verified price
      status: 'pending',
    })
    .select('id')
    .single();

  if (insertError) {
    console.error('Error creating order:', insertError);
    return redirect('/home2?error=order_creation_failed');
  }

  // On success, redirect the user to a dedicated checkout page for this order.
  // This is where you would typically integrate with a payment provider like Stripe.
  redirect(`/checkout/${newOrder.id}`);
}
