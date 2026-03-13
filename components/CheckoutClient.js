"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

// Dynamically import the PaystackButton with SSR disabled.
// This prevents the "window is not defined" error caused by the library 
// evaluating on the server during pre-rendering.
const PaystackButton = dynamic(() => import("./PaystackButton"), {
  ssr: false,
});

/**
 * CheckoutClient Component
 * 
 * A client-side wrapper to handle Paystack success/close callbacks
 * and avoid serialization errors when passing functions from Server Components.
 */
export default function CheckoutClient({ email, amount, orderId }) {
  const router = useRouter();

  const safeAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;

  const handleSuccess = (response) => {
    console.log("PAYSTACK SUCCESS RESPONSE:", response);

    // Extract reference from possible shapes
    const ref = (typeof response === 'string')
      ? response
      : (response.reference || response.trxref || response.tr_ref || "success");

    console.log("Extracted Reference:", ref);

    // Immediate redirection url
    const successUrl = `/checkout/success?reference=${ref}`;

    // Aggressive redirection
    console.log("Attempting direct redirect to:", successUrl);
    window.location.href = successUrl;

    // Fallback in case browser blocks immediate redirect
    setTimeout(() => {
      window.location.assign(successUrl);
    }, 500);
  };

  const handleClose = () => {
    console.log("Paystack modal closed by user.");
  };

  return (
    <PaystackButton
      email={email}
      amount={safeAmount}
      metadata={{ orderId }}
      onSuccess={handleSuccess}
      onClose={handleClose}
    />
  );
}
