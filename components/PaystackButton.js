"use client";

import React from "react";
import { PaystackButton as PaystackButtonComponent } from "react-paystack";

const PaystackButton = ({ email, amount, currency = "KES", metadata, onSuccess, onClose }) => {
  const displayAmount = typeof amount === 'number' ? amount : 0;

  // Configuration for Paystack
  const componentProps = {
    email: email || "customer@example.com",
    amount: Math.round(displayAmount * 100),
    metadata: {
      ...metadata,
      custom_filters: {
        order_id: metadata?.orderId
      }
    },
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    text: `Pay ${currency} ${displayAmount.toFixed(2)} Now`,
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
      <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center">
        Paystack Public Key missing
      </div>
    );
  }

  return (
    <div className="w-full">
      <PaystackButtonComponent
        {...componentProps}
        className="w-full py-6 text-lg bg-black hover:bg-zinc-800 rounded-2xl text-white font-medium transition-colors"
      />
    </div>
  );
};

export default PaystackButton;
