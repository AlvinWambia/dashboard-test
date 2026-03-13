"use client";

import React from 'react';
import { Search, Bell, Mail } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/signOutButton";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

export function AdminHeader({ title, profile, user }) {
  return (
    <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 bg-gray-50 px-4 py-4 lg:px-6 lg:py-4 rounded-3xl gap-4 border border-gray-100 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 w-full lg:w-auto">
        <h1 className="text-xl font-bold lg:hidden mb-2">{title}</h1>
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            className="pl-10 bg-white border-transparent focus:border-black shadow-sm text-sm rounded-2xl w-full h-11" 
            placeholder="Search..." 
          />
        </div>
      </div>

      <div className="flex items-center justify-between lg:justify-end gap-3 w-full lg:w-auto">
        <div className="flex items-center gap-2 lg:gap-3">
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="icon" className="bg-white rounded-full shadow-sm border border-gray-100 h-10 w-10">
                <Mail size={18} />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-40 text-xs">Messages</HoverCardContent>
          </HoverCard>

          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="icon" className="bg-white rounded-full shadow-sm border border-gray-100 h-10 w-10">
                <Bell size={18} />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-40 text-xs">Notifications</HoverCardContent>
          </HoverCard>
          
          <div className="hidden sm:block">
            <SignOutButton />
          </div>
        </div>

        <div className="flex items-center gap-3 pl-2 lg:pl-4 border-l border-gray-200">
          <div className="hidden sm:flex flex-col text-right">
            <p className="text-xs font-bold leading-none text-gray-900">{profile?.full_name || 'Admin'}</p>
            <p className="text-[10px] text-gray-500 mt-1 truncate max-w-[120px]">{user?.email}</p>
          </div>
          <Avatar className="h-10 w-10 border border-white shadow-sm">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-black text-white text-xs">
                {profile?.full_name?.charAt(0) || 'A'}
            </AvatarFallback>
          </Avatar>
        </div>
        
        <div className="sm:hidden">
           <SignOutButton />
        </div>
      </div>
    </header>
  );
}
