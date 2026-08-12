"use client";

import React, { useState } from "react";
import { updateConsultationSettings } from "@/app/actions/settingsActions";
import { toast } from "sonner";
import { Settings, Calendar, Save, Mail, MessageSquare, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettingsClient({ initialSettings }) {
  const [settings, setSettings] = useState({
    booking_url: initialSettings.booking_url || "",
    admin_email: initialSettings.admin_email || "",
    admin_whatsapp: initialSettings.admin_whatsapp || "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateConsultationSettings(settings);
      if (res.success) {
        toast.success("Settings updated successfully!");
      } else {
        toast.error("Failed to save settings", { description: res.error });
      }
    } catch (err) {
      toast.error("An error occurred", { description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="text-black w-6 h-6" /> General Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure global consultation booking URLs, scheduling links, and contact channels.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Calendly / Consultation Booking Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-lg font-bold text-gray-900 border-b border-gray-50 pb-3">
            <Calendar className="text-blue-600 w-5 h-5" /> Consultation Booking Link (Calendly / Acuity)
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
              Global Calendly Booking URL
            </label>
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://calendly.com/your-brand/consultation"
                value={settings.booking_url}
                onChange={(e) => setSettings({ ...settings, booking_url: e.target.value })}
                className="rounded-xl flex-1"
              />
              {settings.booking_url && (
                <a
                  href={settings.booking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors flex items-center justify-center"
                  title="Test link"
                >
                  <ExternalLink size={18} />
                </a>
              )}
            </div>
            <p className="text-xs text-gray-400">
              When clients purchase or book an online 1-on-1 or group consultation, this booking link will be sent to them to pick a Google Meet call slot on your calendar.
            </p>
          </div>
        </div>

        {/* Contact Settings Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-lg font-bold text-gray-900 border-b border-gray-50 pb-3">
            <MessageSquare className="text-emerald-600 w-5 h-5" /> Support & Contact Details
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                Support WhatsApp Number
              </label>
              <Input
                type="text"
                placeholder="+254700000000"
                value={settings.admin_whatsapp}
                onChange={(e) => setSettings({ ...settings, admin_whatsapp: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                Support Email
              </label>
              <Input
                type="email"
                placeholder="myfit@gmail.com"
                value={settings.admin_email}
                onChange={(e) => setSettings({ ...settings, admin_email: e.target.value })}
                className="rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isSaving}
            className="rounded-full bg-black text-white hover:bg-gray-800 px-8 py-3 text-sm font-bold flex items-center gap-2"
          >
            <Save size={16} />
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
