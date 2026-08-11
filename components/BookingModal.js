"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Calendar, CheckCircle2, Phone, Mail } from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";

const PaystackButton = dynamic(() => import("@/components/PaystackButton"), {
  ssr: false,
});

export default function BookingModal({ isOpen, onClose, program, userProfile }) {
  const [notes, setNotes] = useState("");
  const [customerEmail, setCustomerEmail] = useState(userProfile?.email || "");
  const [customerName, setCustomerName] = useState(userProfile?.full_name || "");
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState("");

  if (!program) return null;

  const consultationFee = program.consultation_fee || 0;
  const adminWhatsApp = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "+254700000000";
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "myfit@gmail.com";

  const handlePaymentSuccess = async (response) => {
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          program_id: program._id || program.id,
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
      setIsSuccess(true);
      toast.success("Consultation Booked! 🎉", {
        description: "Your payment was received. Please contact us on WhatsApp or email to schedule your call.",
      });
    } catch (err) {
      console.error("Booking recording error:", err);
      toast.error("Booking Error", { description: err.message });
    }
  };

  const resetAndClose = () => {
    setIsSuccess(false);
    setNotes("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-lg rounded-3xl bg-white p-6 sm:p-8">
        {!isSuccess ? (
          <>
            <DialogHeader className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Calendar className="w-4 h-4 text-blue-600" /> Book Consultation
              </div>
              <DialogTitle className="text-2xl font-bold text-slate-900">
                {program.title || program.name}
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-sm">
                Pay the consultation fee to secure an initial consultation call with our team.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Consultation Fee</p>
                  <p className="text-xl font-bold text-slate-900">Kshs {consultationFee.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-semibold uppercase">Full Session Price</p>
                  <p className="text-sm font-semibold text-slate-600">Kshs {(program.price || 0).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wide">Your Name</label>
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wide">Your Email</label>
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wide">Your Goals / Message (Optional)</label>
                <textarea
                  placeholder="Tell us what you want to achieve or any questions you have..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black resize-none"
                />
              </div>

              <div className="pt-2">
                <PaystackButton
                  email={customerEmail || "customer@example.com"}
                  amount={consultationFee}
                  currency="KES"
                  metadata={{
                    programId: program._id || program.id,
                    programTitle: program.title || program.name,
                    customerName,
                    notes,
                    type: "consultation_booking",
                  }}
                  onSuccess={handlePaymentSuccess}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4 space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-slate-900">Consultation Booked!</h3>
              <p className="text-sm text-slate-500 mt-1">
                Ref: <span className="font-mono text-slate-700 font-semibold">{bookingRef}</span>
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left space-y-3">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Next Step: Schedule Your Call</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Please reach out to us via WhatsApp or Email with your booking reference to agree on a convenient call time.
              </p>

              <div className="pt-2 space-y-2">
                <a
                  href={`https://wa.me/${adminWhatsApp.replace(/[^0-9]/g, "")}?text=Hi!%20I%20just%20booked%20a%20consultation%20for%20${encodeURIComponent(program.title || program.name)}%20(Ref:%20${bookingRef})`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium text-sm transition-all"
                >
                  <MessageSquare className="w-5 h-5" /> Contact on WhatsApp
                </a>

                <a
                  href={`mailto:${adminEmail}?subject=Consultation%20Booking%20Ref:%20${bookingRef}&body=Hi,%20I%20have%20booked%20a%20consultation%20for%20${encodeURIComponent(program.title || program.name)}.`}
                  className="flex items-center gap-3 p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-sm transition-all"
                >
                  <Mail className="w-5 h-5" /> Send Email
                </a>
              </div>
            </div>

            <Button onClick={resetAndClose} variant="outline" className="w-full rounded-xl">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
