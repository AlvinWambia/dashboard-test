'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import TiptapEditor from "./TiptapEditor";
import { AdminEmailTemplate } from "../emails/AdminEmailTemplate";
import { toast } from "sonner";
import { Loader2, Send, Eye, PenTool, Users } from "lucide-react";

export default function AnnouncementModal({ isOpen, onClose, userCount = 0 }) {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('<p>Hello,</p><p></p><p>We have an exciting update to share with you...</p>');
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState('edit');

  const handleClose = () => {
    onClose();
    // Reset after close animation
    setTimeout(() => {
      setSubject('');
      setContent('<p>Hello,</p><p></p><p>We have an exciting update to share with you...</p>');
      setActiveTab('edit');
    }, 300);
  };

  const handleSend = async () => {
    if (!subject.trim()) {
      toast.error('Please enter a subject.');
      return;
    }
    if (!content || content === '<p></p>') {
      toast.error('Please write your announcement content.');
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('/api/admin/send-announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, html: content }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`Announcement sent! 🎉`, {
          description: `Successfully delivered to ${result.count} member${result.count !== 1 ? 's' : ''}.`,
        });
        handleClose();
      } else {
        toast.error('Failed to send announcement.', {
          description: result.error || 'An unexpected error occurred.',
        });
      }
    } catch (err) {
      console.error('Send announcement error:', err);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl bg-white rounded-3xl p-0 overflow-hidden outline-none border-none max-h-[90vh] flex flex-col">
        <DialogHeader className="p-6 pb-2">
          <div className="flex justify-between items-start mr-8">
            <div>
              <DialogTitle className="text-2xl font-bold">
                Send Announcement
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                <Users className="w-3.5 h-3.5" />
                Broadcast to all{' '}
                <Badge variant="secondary" className="rounded-full px-2 py-0 text-xs font-medium">
                  {userCount} member{userCount !== 1 ? 's' : ''}
                </Badge>
              </DialogDescription>
            </div>

            {/* Edit / Preview tab switcher */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
              <TabsList className="bg-gray-100 rounded-xl p-1">
                <TabsTrigger
                  value="edit"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <PenTool className="w-4 h-4 mr-2" /> Edit
                </TabsTrigger>
                <TabsTrigger
                  value="preview"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Eye className="w-4 h-4 mr-2" /> Preview
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </DialogHeader>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto min-h-[420px]">
          <Tabs value={activeTab} className="w-full h-full">

            {/* ── Edit tab ── */}
            <TabsContent value="edit" className="m-0 p-6 space-y-4 focus-visible:outline-none">
              <div className="space-y-2">
                <Label htmlFor="announcement-subject">Subject</Label>
                <Input
                  id="announcement-subject"
                  placeholder="e.g. New program drop, Exciting news from myFit…"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="rounded-xl border-gray-200"
                />
              </div>

              <div className="space-y-2">
                <Label>Message</Label>
                <TiptapEditor content={content} onChange={setContent} />
              </div>
            </TabsContent>

            {/* ── Preview tab ── */}
            <TabsContent
              value="preview"
              className="m-0 p-0 h-full bg-gray-100 focus-visible:outline-none"
            >
              <div className="p-6 pb-2">
                <p className="text-xs text-gray-400 text-center">
                  This is how the email will look in your members' inboxes.
                </p>
              </div>
              <div className="p-6 pt-2 flex justify-center">
                <div className="shadow-2xl scale-[0.85] origin-top transition-all duration-300">
                  <AdminEmailTemplate
                    subject={subject || 'Your Announcement Subject'}
                    htmlContent={content}
                    isPreview={true}
                  />
                </div>
              </div>
            </TabsContent>

          </Tabs>
        </div>

        {/* ── Footer ── */}
        <DialogFooter className="p-6 border-t bg-gray-50/50 flex-row items-center justify-between sm:justify-between">
          <p className="text-xs text-gray-400">
            Will send to <span className="font-semibold text-gray-600">{userCount} member{userCount !== 1 ? 's' : ''}</span>
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleClose} disabled={isSending}>
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={isSending}
              className="bg-black text-white hover:bg-zinc-800 rounded-xl px-8"
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send to All
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
