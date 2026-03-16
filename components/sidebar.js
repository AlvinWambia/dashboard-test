"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ListTodo, Calendar, BarChart3, Users,
  Settings, LifeBuoy, LogOut, Menu,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: ListTodo, label: "Tasks", href: "/admin/tasks", badge: "12+" },
  { icon: Calendar, label: "Calendar", href: "/admin/calendar" },
  { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
  { icon: Users, label: "Members", href: "/admin/members" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (!pathname?.startsWith("/admin")) return null;

  const SidebarContent = () => (
    <>
      <div className="flex h-14 items-center pl-4 lg:h-[60px] lg:pl-6 border-b border-gray-100 dark:border-gray-800">
        <Link href="/" className="flex items-center gap-2 font-semibold text-xl">
          <p className="text-black">myFit</p>
        </Link>
      </div>    <nav className="flex flex-col gap-1">
        <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider px-3">Menu</p>
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={cn(
              "flex items-center justify-between p-3 rounded-xl transition-all text-sm",
              pathname === item.href
                ? "bg-black text-white shadow-md"
                : "text-gray-500 hover:bg-gray-100"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} />
              <span className="font-sm">{item.label}</span>
            </div>
            {item.badge && (
              <Badge className={cn(
                "border-none",
                pathname === item.href ? "bg-white/20 text-black" : "bg-black text-white"
              )}>
                {item.badge}
              </Badge>
            )}
          </Link>
        ))}
      </nav>

      <div className="mt-auto bg-[#081C15] rounded-2xl p-4 text-white">
        <p className="font-semibold text-sm justify-left text-align-left">Welcome to Admin Page</p>
        <Button variant="secondary" size="sm" className="mt-3 w-full bg-white text-black border-2none">
          See more
        </Button>
      </div>
    </>
  );

  return (
    <>
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-white shadow-md">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-6 flex flex-col gap-8">
            <SheetHeader className="sr-only">
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>
                A list of navigation links for the admin dashboard.
              </SheetDescription>
            </SheetHeader>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      <aside className="w-64 bg-white h-[calc(100vh-2rem)] sticky top-4 m-4 rounded-3xl p-6 hidden lg:flex flex-col gap-8">
        <SidebarContent />
      </aside>
    </>
  );
}