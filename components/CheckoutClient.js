"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteOrder } from "@/app/actions/deleteOrder";

// Dynamically import the PaystackButton with SSR disabled.
const PaystackButton = dynamic(() => import("./PaystackButton"), {
  ssr: false,
});

export default function CheckoutClient({ email, amount, orderId }) {
  const router = useRouter();

  const safeAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;

  // 1. Intercept Browser Back Button
  useEffect(() => {
    // Push a dummy state so the first 'back' action triggers popstate without leaving
    window.history.pushState(null, "", window.location.href);

    const handlePopState = (event) => {
      // Show the cancellation toast instead of navigating back immediately
      triggerCancelToast();
      // Re-push state to keep the user on the page until they confirm
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [orderId]);

  const triggerCancelToast = () => {
    toast("Cancel Order?", {
      description: "Are you sure you want to cancel this order? This will delete your pending order details.",
      action: {
        label: "Yes, Cancel",
        onClick: async () => {
          toast.loading("Cancelling order...");
          const result = await deleteOrder(orderId);
          if (result.success) {
            toast.success("Order cancelled.");
            router.push("/home2");
          } else {
            toast.error("Failed to delete order, but you can still leave.");
            router.push("/home2");
          }
        },
      },
      cancel: {
        label: "No, Stay",
        onClick: () => console.log("User chose to stay"),
      },
      duration: 10000,
    });
  };

  const handleSuccess = (response) => {
    console.log("PAYSTACK SUCCESS RESPONSE:", response);
    const ref = (typeof response === 'string')
      ? response
      : (response.reference || response.trxref || response.tr_ref || "success");

    const successUrl = `/checkout/success?reference=${ref}`;
    window.location.href = successUrl;
  };

  const handleClose = () => {
    console.log("Paystack modal closed by user.");
    triggerCancelToast(); // Also trigger on modal close
  };

  return (
    <div className="space-y-4">
      <PaystackButton
        email={email}
        amount={safeAmount}
        metadata={{ orderId }}
        onSuccess={handleSuccess}
        onClose={handleClose}
      />
      <button
        onClick={triggerCancelToast}
        className="w-full py-2 text-sm text-slate-500 hover:text-red-500 transition-colors"
      >
        Cancel Order
      </button>
    </div>
  );
}
