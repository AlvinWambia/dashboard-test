"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, CheckCircle2, Loader2, CreditCard, ExternalLink, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { usePaystackPayment } from "react-paystack";

const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL ||
  "https://calendly.com/wambialvin/program-set-up-meeting";

export default function BookingModal({ isOpen, onClose, program, userProfile }) {
  const [notes, setNotes] = useState("");
  const [customerEmail, setCustomerEmail] = useState(userProfile?.email || "");
  const [customerName, setCustomerName] = useState(userProfile?.full_name || "");
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [isScheduled, setIsScheduled] = useState(false);
  const [activeProgram, setActiveProgram] = useState(null);

  useEffect(() => {
    if (program) {
      setActiveProgram(program);
    }
  }, [program]);

  // ── All hooks above early returns (Rules of Hooks) ───────────────────────

  const consultationFee = activeProgram?.consultation_fee || 0;

  const paystackConfig = {
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
    email: customerEmail || "customer@example.com",
    amount: Math.round(consultationFee * 100),
    currency: "KES",
    reference: `consult_${activeProgram?._id || activeProgram?.id || "na"}_${Date.now()}`,
    metadata: {
      programId: activeProgram?._id || activeProgram?.id,
      programTitle: activeProgram?.title || activeProgram?.name,
      customerName,
      notes,
      type: "consultation_booking",
    },
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const handlePaymentSuccess = useCallback(
    async (response) => {
      setIsPaying(false);
      try {
        const res = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            program_id: activeProgram?._id || activeProgram?.id,
            user_id: userProfile?.id || null,
            notes,
            consultation_paid: true,
            consultation_payment_ref: response.reference || response.trxref,
            customer_email: customerEmail,
            customer_name: customerName,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to record booking");

        setBookingRef(response.reference || response.trxref);
        if (data.booking && data.booking.id) {
          setBookingId(data.booking.id);
        }
        setIsSuccess(true);
      } catch (err) {
        console.error("Booking recording error:", err);
        toast.error("Booking Error", { description: err.message });
      }
    },
    [activeProgram, userProfile, notes, customerEmail, customerName]
  );

  useEffect(() => {
    const handleCalendlyMessage = async (e) => {
      if (e.data && e.data.event === "calendly.event_scheduled") {
        console.log("Calendly event scheduled:", e.data);
        setIsScheduled(true);

        if (bookingId) {
          try {
            await fetch(`/api/bookings/${bookingId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "confirmed" }),
            });
            toast.success("Consultation Scheduled!", {
              description: "Your session has been successfully booked and confirmed.",
            });
          } catch (err) {
            console.error("Error updating booking status:", err);
          }
        }
      }
    };

    window.addEventListener("message", handleCalendlyMessage);
    return () => {
      window.removeEventListener("message", handleCalendlyMessage);
    };
  }, [bookingId]);

  // ── Early return after all hooks ─────────────────────────────────────────
  if (!activeProgram) return null;

  const handlePayNow = () => {
    if (!customerEmail || !customerName) {
      toast.error("Missing Details", {
        description: "Please fill in your name and email before paying.",
      });
      return;
    }
    if (!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
      toast.error("Configuration Error", {
        description: "Payment is not configured. Please contact support.",
      });
      return;
    }

    setIsPaying(true);
    onClose(); // Temporarily close the dialog so the focus trap releases and Paystack is interactive

    setTimeout(() => {
      initializePayment({
        onSuccess: (response) => handlePaymentSuccess(response),
        onClose: () => {
          setIsPaying(false);
          setIsSuccess(false);
        },
      });
    }, 150);
  };

  const handleOpenCalendly = () => {
    const url = `${CALENDLY_URL}?name=${encodeURIComponent(customerName)}&email=${encodeURIComponent(customerEmail)}&hide_gdpr_banner=1`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const resetAndClose = () => {
    setIsSuccess(false);
    setIsScheduled(false);
    setBookingId("");
    setNotes("");
    setActiveProgram(null);
    onClose();
  };

  const formattedAmount = consultationFee.toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <Dialog
      open={isOpen || isSuccess}
      onOpenChange={(open) => { if (!open) resetAndClose(); }}
    >
      <DialogContent 
        className={`rounded-3xl bg-white p-6 sm:p-8 transition-all duration-300 ${
          isSuccess && !isScheduled 
            ? "sm:max-w-3xl w-full h-[85vh] max-h-[750px] flex flex-col" 
            : "sm:max-w-lg"
        }`}
      >
        {!isSuccess ? (
          <>
            <DialogHeader className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Calendar className="w-4 h-4 text-blue-600" /> Book Consultation
              </div>
              <DialogTitle className="text-2xl font-bold text-slate-900">
                {activeProgram.title || activeProgram.name}
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-sm">
                Pay the consultation fee to secure an initial consultation call with our team.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Consultation Fee</p>
                  <p className="text-xl font-bold text-slate-900">
                    Kshs {consultationFee.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-semibold uppercase">Full Session Price</p>
                  <p className="text-sm font-semibold text-slate-600">
                    Kshs {(activeProgram.price || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wide">
                  Your Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wide">
                  Your Email
                </label>
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wide">
                  Your Goals / Message (Optional)
                </label>
                <textarea
                  placeholder="Tell us what you want to achieve or any questions you have..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handlePayNow}
                  disabled={isPaying}
                  className="w-full py-4 text-base font-semibold bg-black hover:bg-zinc-800 active:scale-[0.99] rounded-2xl text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isPaying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Opening Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Pay KES {formattedAmount} Now
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : !isScheduled ? (
          <div className="flex flex-col h-full flex-1">
            <DialogHeader className="space-y-1 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600">
                <CheckCircle2 className="w-4 h-4" /> Payment Confirmed
              </div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                Schedule Your Consultation
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-xs">
                Pick a slot below to complete your booking. The schedule is synced instantly.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 w-full mt-4 rounded-xl overflow-hidden border border-slate-100 min-h-[400px] relative bg-slate-50">
              <iframe
                src={`${CALENDLY_URL}?name=${encodeURIComponent(customerName)}&email=${encodeURIComponent(customerEmail)}&hide_gdpr_banner=1&embed_domain=${encodeURIComponent(typeof window !== "undefined" ? window.location.origin : "")}`}
                width="100%"
                height="100%"
                style={{ border: "0" }}
                className="w-full h-full"
              />
            </div>

            <div className="pt-3 flex flex-col sm:flex-row justify-between items-center gap-2 border-t border-slate-100 mt-4">
              <p className="text-xs text-slate-400">
                Having trouble?{" "}
                <button
                  onClick={handleOpenCalendly}
                  className="text-blue-600 hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  Open in a new window <ExternalLink className="w-3 h-3" />
                </button>
              </p>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  onClick={() => setIsScheduled(true)}
                  variant="outline"
                  className="text-xs rounded-xl w-full sm:w-auto"
                >
                  I&apos;ve Scheduled Already
                </Button>
                <Button
                  onClick={resetAndClose}
                  variant="ghost"
                  className="text-xs rounded-xl text-slate-400 hover:text-slate-600 w-full sm:w-auto"
                >
                  Close & Do Later
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 space-y-6 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">You&apos;re All Set!</h3>
              <p className="text-slate-500 max-w-sm mx-auto text-sm">
                Your consultation payment of <strong>Kshs {formattedAmount}</strong> has been received, and your session has been successfully booked.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 w-full text-left space-y-3">
              <h4 className="text-sm font-bold text-slate-700">What happens next?</h4>
              <ul className="text-xs text-slate-500 space-y-2 list-disc list-inside">
                <li>A Google Meet invitation has been sent to your email.</li>
                <li>You will receive reminder notifications leading up to the session.</li>
                <li>You can view and manage your scheduled sessions from your Profile page.</li>
              </ul>
            </div>
            <Button onClick={resetAndClose} className="w-full rounded-2xl py-4 bg-black hover:bg-zinc-800 text-white font-semibold cursor-pointer">
              Awesome, Go to Dashboard
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
