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

  // 2. Delete the order
  // Note: We include user_id in the filter for security to ensure users can only delete their own orders.
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting order:', error);
    return { success: false, error: error.message };
  }

  // 3. Revalidate paths if necessary
  revalidatePath('/orders');
  revalidatePath('/home2');

  return { success: true };
}
