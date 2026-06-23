"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Mail, User, Phone, MapPin, 
  Activity, Target, HeartPulse, CalendarDays,
  MessageSquare, Send, Clock, Plus, CreditCard, Receipt
} from 'lucide-react';
import { toast } from 'sonner';
import { addClientNote } from '@/app/actions/clientNotes';
import { formatDistanceToNow, parseISO, format } from 'date-fns';

export default function ClientDetailView({ client, initialNotes, paymentHistory }) {
  const router = useRouter();
  const [noteText, setNoteText] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  
  // Email state
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    
    setIsSubmittingNote(true);
    const result = await addClientNote(client.id, noteText);
    setIsSubmittingNote(false);
    
    if (result.success) {
      toast.success("Note added successfully");
      setNoteText("");
    } else {
      toast.error(result.error || "Failed to add note");
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSendingEmail(true);
    try {
      const response = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: client.email,
          subject: emailSubject,
          html: `<div style="font-family: sans-serif; white-space: pre-wrap;">${emailBody}</div>`,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || "Failed to send email");

      toast.success("Email sent successfully!");
      setIsEmailModalOpen(false);
      setEmailSubject("");
      setEmailBody("");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to send email");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const formatDisplayValue = (val) => {
    if (!val) return 'N/A';
    if (typeof val === 'string') return val.charAt(0).toUpperCase() + val.slice(1).replace(/-/g, ' ');
    return val;
  };

  const programName = client.orders?.program_name || 'No Program Linked';

  return (
    <div className="p-8 max-w-7xl mx-auto w-full animate-in fade-in-0 duration-500 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/clients" className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-all text-gray-500">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{client.full_name}</h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-xs font-semibold">{programName}</span>
              • Joined {formatDistanceToNow(parseISO(client.created_at))} ago
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsEmailModalOpen(true)}
          className="bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm active:scale-95"
        >
          <Mail size={18} />
          Send Email
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Assessment Data */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4 text-gray-800 border-b border-gray-50 pb-4">
              <User size={20} className="text-blue-500" />
              <h2 className="text-lg font-bold">Personal Information</h2>
            </div>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <InfoItem label="Email" value={client.email} />
              <InfoItem label="Phone" value={client.phone_number} />
              <InfoItem label="Birth Date" value={client.birth_date ? format(parseISO(client.birth_date), 'MMMM d, yyyy') : null} />
              <InfoItem label="Gender" value={client.gender} />
            </div>
          </div>

          {/* Body & Activity */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4 text-gray-800 border-b border-gray-50 pb-4">
              <Activity size={20} className="text-orange-500" />
              <h2 className="text-lg font-bold">Body & Activity</h2>
            </div>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <InfoItem label="Current Weight" value={client.current_weight ? `${client.current_weight} kg` : null} />
              <InfoItem label="Height" value={client.height ? `${client.height} cm` : null} />
              <InfoItem label="Activity Level" value={formatDisplayValue(client.activity_level)} />
              <InfoItem label="Training Level" value={formatDisplayValue(client.training_level)} />
            </div>
          </div>

          {/* Goals */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4 text-gray-800 border-b border-gray-50 pb-4">
              <Target size={20} className="text-emerald-500" />
              <h2 className="text-lg font-bold">Goals</h2>
            </div>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <InfoItem label="Main Goal" value={formatDisplayValue(client.goal)} />
              <InfoItem label="Target Weight" value={client.target_weight ? `${client.target_weight} kg` : null} />
              <div className="col-span-2">
                <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Goal Description</p>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100 min-h-[60px] whitespace-pre-wrap">
                  {client.goal_description || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Medical */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4 text-gray-800 border-b border-gray-50 pb-4">
              <HeartPulse size={20} className="text-red-500" />
              <h2 className="text-lg font-bold">Medical Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Injuries</p>
                <p className="text-sm text-gray-900 bg-red-50/50 p-3 rounded-lg border border-red-50 min-h-[60px] whitespace-pre-wrap">
                  {client.injuries || 'None reported'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Medical Conditions</p>
                <p className="text-sm text-gray-900 bg-red-50/50 p-3 rounded-lg border border-red-50 min-h-[60px] whitespace-pre-wrap">
                  {client.medical_conditions || 'None reported'}
                </p>
              </div>
            </div>
          </div>

          {/* Billing & Payments */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
            <div className="flex items-center gap-2 mb-6 text-gray-800 border-b border-gray-50 pb-4">
              <CreditCard size={20} className="text-blue-600" />
              <h2 className="text-lg font-bold">Billing & Payments</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Subscription Status</p>
                {client.subscription ? (
                  <div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${
                      client.subscription.status === 'active' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 
                      client.subscription.status === 'cancelled' ? 'bg-red-100 text-red-800 border-red-200' :
                      'bg-amber-100 text-amber-800 border-amber-200'
                    }`}>
                      {client.subscription.status.charAt(0).toUpperCase() + client.subscription.status.slice(1)}
                    </span>
                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-gray-600"><span className="font-medium text-gray-900">Plan Code:</span> {client.subscription.plan_code}</p>
                      {client.subscription.next_billing_date && (
                        <p className="text-sm text-gray-600"><span className="font-medium text-gray-900">Next Billing:</span> {format(parseISO(client.subscription.next_billing_date), 'MMMM d, yyyy')}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 italic">No active subscription found.</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Receipt size={16} className="text-gray-400" /> Payment History
              </h3>
              
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="p-3 font-semibold text-gray-600">Date</th>
                      <th className="p-3 font-semibold text-gray-600">Amount</th>
                      <th className="p-3 font-semibold text-gray-600">Reference</th>
                      <th className="p-3 font-semibold text-gray-600 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {paymentHistory?.length > 0 ? (
                      paymentHistory.map(payment => (
                        <tr key={payment.id} className="hover:bg-gray-50/50">
                          <td className="p-3 text-gray-600">{payment.paid_at ? format(parseISO(payment.paid_at), 'MMM d, yyyy') : 'N/A'}</td>
                          <td className="p-3 font-medium text-gray-900">{payment.currency} {payment.amount}</td>
                          <td className="p-3 text-gray-500 font-mono text-xs">{payment.reference}</td>
                          <td className="p-3 text-right">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                              payment.status === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="p-6 text-center text-gray-500">
                          No payment history available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Notes & Communications */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[800px]">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-2 text-gray-800">
                <MessageSquare size={20} className="text-purple-500" />
                <h2 className="text-lg font-bold">Private Notes</h2>
              </div>
              <p className="text-xs text-gray-500 mt-1">These notes are only visible to admins.</p>
            </div>

            <div className="flex-1 p-6 overflow-y-auto bg-gray-50/30">
              {initialNotes?.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <MessageSquare size={32} className="mb-2 opacity-50" />
                  <p className="text-sm">No notes yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {initialNotes?.map(note => (
                    <div key={note.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                      <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{note.note}</p>
                      <p className="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
                        <Clock size={12} />
                        {formatDistanceToNow(parseISO(note.created_at))} ago
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-white rounded-b-2xl">
              <form onSubmit={handleAddNote}>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Type a new note here..."
                  className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none min-h-[100px]"
                />
                <button 
                  type="submit"
                  disabled={isSubmittingNote || !noteText.trim()}
                  className="mt-3 w-full bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmittingNote ? "Saving..." : <><Plus size={16} /> Add Note</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Mail size={20} className="text-blue-500" />
                Send Email to {client.full_name}
              </h3>
              <button 
                onClick={() => setIsEmailModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSendEmail} className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">To</label>
                  <input 
                    type="text" 
                    value={client.email} 
                    disabled 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Subject</label>
                  <input 
                    type="text" 
                    value={emailSubject}
                    onChange={e => setEmailSubject(e.target.value)}
                    placeholder="Enter email subject"
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Message</label>
                  <textarea 
                    value={emailBody}
                    onChange={e => setEmailBody(e.target.value)}
                    placeholder="Type your message here..."
                    rows={8}
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSendingEmail || !emailSubject.trim() || !emailBody.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm disabled:opacity-50 flex items-center gap-2 active:scale-95"
                >
                  {isSendingEmail ? "Sending..." : <><Send size={16} /> Send Email</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value || 'N/A'}</p>
    </div>
  );
}
