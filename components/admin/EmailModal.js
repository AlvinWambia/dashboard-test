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
import TiptapEditor from "./TiptapEditor";
import { AdminEmailTemplate } from "../emails/AdminEmailTemplate";
import { toast } from "sonner";
import { Loader2, Send, Eye, PenTool } from "lucide-react";

export default function EmailModal({ isOpen, onClose, recipient }) {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");

  // Update content when recipient changes
  React.useEffect(() => {
    if (recipient) {
      setContent("<p>Hello " + (recipient.full_name || "") + ",</p>");
    }
  }, [recipient]);

  const handleSend = async () => {
    console.log("handleSend triggered");
    console.log("Recipient:", recipient);
    console.log("Subject:", subject);

    if (!subject) {
      toast.error("Please enter a subject.");
      return;
    }
    if (!content || content === "<p></p>") {
      toast.error("Please enter some content.");
      return;
    }

    setIsSending(true);
    try {
      console.log("Sending fetch request to /api/admin/send-email...");
      const response = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: recipient?.email,
          subject,
          html: content,
        }),
      });

      console.log("Response status:", response.status);
      const result = await response.json();
      console.log("Result:", result);

      if (response.ok) {
        toast.success("Email sent successfully!");
        onClose();
        setSubject("");
      } else {
        toast.error(result.error || "Failed to send email.");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-white rounded-3xl p-0 overflow-hidden outline-none border-none max-h-[90vh] flex flex-col">
        <DialogHeader className="p-6 pb-2">
          <div className="flex justify-between items-center mr-8">
            <div>
              <DialogTitle className="text-2xl font-bold">Compose Email</DialogTitle>
              <DialogDescription>
                To: {recipient?.full_name} ({recipient?.email})
              </DialogDescription>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
              <TabsList className="bg-gray-100 rounded-xl p-1">
                <TabsTrigger value="edit" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <PenTool className="w-4 h-4 mr-2" />
                  Edit
                </TabsTrigger>
                <TabsTrigger value="preview" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-[400px]">
          <Tabs value={activeTab} className="w-full h-full">
            <TabsContent value="edit" className="m-0 p-6 space-y-4 focus-visible:outline-none">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Enter subject..."
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

            <TabsContent value="preview" className="m-0 p-0 h-full bg-gray-100 focus-visible:outline-none">
              <div className="p-8 flex justify-center">
                <div className="shadow-2xl scale-[0.85] origin-top transition-all duration-300">
                  <AdminEmailTemplate 
                    subject={subject || "Message Subject"} 
                    htmlContent={content} 
                    isPreview={true}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="p-6 border-t bg-gray-50/50">
          <Button variant="ghost" onClick={onClose} disabled={isSending}>
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
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
