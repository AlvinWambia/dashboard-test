'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import AnnouncementModal from './AnnouncementModal';

export default function AnnouncementButton({ userCount }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        className="text-sm bg-white rounded-2xl border border-black text-black hover:bg-black hover:text-white mt-6 w-full"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="w-3 h-3 mr-2" /> Add Announcement
      </Button>

      <AnnouncementModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userCount={userCount}
      />
    </>
  );
}
