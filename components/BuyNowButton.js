'use client';

import { useFormStatus } from 'react-dom';
import { createOrder } from '@/app/actions/createOrder';
import { Button } from '@/components/ui/button';

/**
 * A dedicated button component to handle the form submission status.
 * This provides a better user experience by showing a loading state.
 */
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      variant="outline"
      className="w-full rounded-full border-slate-900 px-6 font-bold hover:bg-slate-900 hover:text-white transition-all"
    >
      {pending ? 'Processing...' : 'Buy Now'}
    </Button>
  );
}

export function BuyNowButton({ product }) {
  // Bind the product's custom ID to the server action. This pre-fills the first argument of createOrder.
  const createOrderWithId = createOrder.bind(null, product.productId);

  return (
    <form action={createOrderWithId} className="w-full">
      <SubmitButton />
    </form>
  );
}
