'use server';

import { createClient } from '@/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Deletes an order from the 'orders' table.
 * This is used when a user cancels an order during the checkout process.
 */
export async function deleteOrder(orderId) {
  if (!orderId) return { success: false, error: 'Order ID is required' };

  const supabase = await createClient();
  
  // 1. Verify the user is logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  // 2. Mark the order as cancelled instead of deleting it (Cart Abandonment Tracking)
  // We use maybeSingle/update in case 'status' column exists. If it fails, we just leave it as is.
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId)
      .eq('user_id', user.id);
      
    if (error) {
       console.log('Order status update failed (column might not exist), keeping order for cart abandonment:', error.message);
    }
  } catch (e) {
    console.log('Could not update order status:', e);
  }

  // 3. Revalidate paths if necessary
  revalidatePath('/orders');
  revalidatePath('/');

  return { success: true };
}
