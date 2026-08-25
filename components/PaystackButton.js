"use client";

import React from "react";
import { PaystackButton as PaystackButtonComponent } from "react-paystack";

const PaystackButton = ({ email, amount, currency = "KES", metadata, planCode, onSuccess, onClose }) => {
  const displayAmount = typeof amount === 'number' ? amount : 0;

  const formattedAmount = displayAmount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Configuration for Paystack
  const componentProps = {
    email: email || "customer@example.com",
    amount: Math.round(displayAmount * 100),
    ...(planCode ? { plan: planCode } : {}),
    metadata: {
      ...metadata,
      custom_filters: {
        order_id: metadata?.orderId
      }
    },
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    text: `Pay ${currency} ${formattedAmount} Now`,
    onSuccess: (response) => {
      console.log("PAYSTACK COMPONENT SUCCESS:", response);
      if (onSuccess) onSuccess(response);
    },
    onClose: () => {
      console.log("PAYSTACK COMPONENT CLOSED");
      if (onClose) onClose();
    },
    reference: metadata?.orderId ? `${metadata.orderId}_${Date.now()}` : (new Date()).getTime().toString(),
    currency: currency,
  };

  if (!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center text-sm font-medium">
        Paystack Configuration Error: NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is missing.
      </div>
    );
  }

  return (
    <div className="w-full">
      <PaystackButtonComponent
        {...componentProps}
        className="w-full py-4 text-base font-semibold bg-black hover:bg-zinc-800 active:scale-[0.99] rounded-2xl text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
      />
    </div>
  );
};

export default PaystackButton;
