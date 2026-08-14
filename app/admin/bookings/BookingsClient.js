"use client";

import React, { useState, useEffect } from "react";
import { Search, Calendar, CheckCircle2, Clock, XCircle, Check, Copy, ExternalLink, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function BookingsClient({ initialBookings }) {
  const [bookings, setBookings] = useState(initialBookings || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    setBookings(initialBookings || []);
  }, [initialBookings]);

  const updateBooking = async (id, newStatus, unlockedPurchase) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          unlocked_purchase: unlockedPurchase,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update booking");

      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...data.booking } : b))
      );

      toast.success(`Booking status updated to ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to update booking");
    } finally {
      setLoadingId(null);
    }
  };

  const copyDirectPurchaseLink = (programId) => {
    const link = `${window.location.origin}/programs/${programId}/onboarding`;
    navigator.clipboard.writeText(link);
    toast.success("Purchase link copied to clipboard! 📋");
  };

  const filteredBookings = bookings.filter((booking) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      booking.programs?.title?.toLowerCase().includes(q) ||
      booking.profiles?.full_name?.toLowerCase().includes(q) ||
      booking.profiles?.email?.toLowerCase().includes(q) ||
      booking.consultation_payment_ref?.toLowerCase().includes(q) ||
      booking.notes?.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full animate-in fade-in-0 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Consultation Bookings
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Manage consultation calls and unlock full program purchases.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none w-full sm:w-auto"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="needs_followup">Needs Follow-Up</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Search */}
          <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2 w-full sm:w-64">
            <Search size={18} className="text-gray-400 ml-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-none focus:ring-0 text-sm outline-none w-full bg-transparent"
            />
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="p-4 pl-6">Client / Contact</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Program</th>
              <th className="p-4">Payment Ref</th>
              <th className="p-4">Status</th>
              <th className="p-4">Unlocked</th>
              <th className="p-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {filteredBookings.map((b) => {
              const isPending = b.status === "pending";
              const isConfirmed = b.status === "confirmed";
              const isCompleted = b.status === "completed";
              const isNeedsFollowup = b.status === "needs_followup";
              const isCancelled = b.status === "cancelled";

              return (
                <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 pl-6">
                    <p className="font-semibold text-gray-900">
                      {b.profiles?.full_name || b.customer_name || "Guest Customer"}
                    </p>
                    <p className="text-xs text-gray-500">{b.profiles?.email || b.customer_email || "No email"}</p>
                    {b.notes && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg mt-1 italic line-clamp-2 max-w-xs">
                        "{b.notes}"
                      </p>
                    )}
                  </td>
                  
                  <td className="p-4">
                    <p className="text-sm text-gray-900">{b.customer_phone || b.profiles?.phone || "No phone"}</p>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{b.programs?.title || "Unknown Program"}</p>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded">
                        Round {b.consultation_round || 1}
                      </span>
                    </div>
                    {b.parent_booking_id && (
                      <p className="text-[10px] text-gray-400 mt-0.5">Parent: {b.parent_booking_id.split('-')[0]}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Fee: Kshs {(b.programs?.consultation_fee || 0).toLocaleString()}
                    </p>
                  </td>

                  <td className="p-4 font-mono text-xs text-gray-600">
                    {b.consultation_payment_ref || "N/A"}
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
                        isCompleted
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : isConfirmed
                          ? "bg-blue-50 text-blue-700 border-blue-100"
                          : isNeedsFollowup
                          ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                          : isCancelled
                          ? "bg-red-50 text-red-700 border-red-100"
                          : "bg-amber-50 text-amber-700 border-amber-100"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>

                  <td className="p-4">
                    {b.unlocked_purchase ? (
                      <span className="px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-800 rounded-full flex items-center gap-1 w-fit">
                        <Check className="w-3 h-3" /> Yes
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">No</span>
                    )}
                  </td>

                  <td className="p-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isPending && (
                        <button
                          onClick={() => updateBooking(b.id, "confirmed", false)}
                          disabled={loadingId === b.id}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-lg transition"
                        >
                          Confirm Call
                        </button>
                      )}

                      {!isCompleted && !isNeedsFollowup && !isCancelled && (
                        <>
                          <button
                            onClick={() => updateBooking(b.id, "completed", true)}
                            disabled={loadingId === b.id}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg shadow-sm transition"
                          >
                            ✅ Complete & Unlock
                          </button>
                          <button
                            onClick={() => updateBooking(b.id, "needs_followup", false)}
                            disabled={loadingId === b.id}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg shadow-sm transition"
                          >
                            🔁 Complete — Needs Follow-Up
                          </button>
                        </>
                      )}

                      {b.unlocked_purchase && b.program_id && (
                        <button
                          onClick={() => copyDirectPurchaseLink(b.program_id)}
                          className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition"
                          title="Copy Direct Purchase Link"
                        >
                          <Copy size={16} />
                        </button>
                      )}

                      {!isCancelled && (
                        <button
                          onClick={() => updateBooking(b.id, "cancelled", false)}
                          disabled={loadingId === b.id}
                          className="px-2 py-1 text-red-500 hover:bg-red-50 rounded-lg text-xs transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredBookings.length === 0 && (
              <tr>
                <td colSpan="6" className="p-12 text-center text-gray-500">
                  <Calendar size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="font-medium text-gray-900">No bookings found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Grid View */}
      <div className="block md:hidden space-y-4">
        {filteredBookings.map((b) => (
          <div key={b.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  {b.profiles?.full_name || b.customer_name || "Guest Customer"}
                </h3>
                <p className="text-xs text-gray-500">{b.customer_phone || b.profiles?.phone || "No phone"}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs font-medium text-gray-700">{b.programs?.title}</p>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded">
                    Round {b.consultation_round || 1}
                  </span>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
                  b.status === "completed"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                    : b.status === "confirmed"
                    ? "bg-blue-50 text-blue-700 border-blue-100"
                    : b.status === "needs_followup"
                    ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                    : b.status === "cancelled"
                    ? "bg-red-50 text-red-700 border-red-100"
                    : "bg-amber-50 text-amber-700 border-amber-100"
                }`}
              >
                {b.status}
              </span>
            </div>

            {b.notes && (
              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl italic">
                "{b.notes}"
              </p>
            )}

            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100">
              <span className="text-xs text-gray-400 font-mono">
                Ref: {b.consultation_payment_ref || "N/A"}
              </span>

              <div className="flex items-center gap-2">
                {b.status === "pending" && (
                  <button
                    onClick={() => updateBooking(b.id, "confirmed", false)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg"
                  >
                    Confirm
                  </button>
                )}

                {b.status !== "completed" && b.status !== "needs_followup" && b.status !== "cancelled" && (
                  <>
                    <button
                      onClick={() => updateBooking(b.id, "completed", true)}
                      className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => updateBooking(b.id, "needs_followup", false)}
                      className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg"
                    >
                      Needs Follow-Up
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
