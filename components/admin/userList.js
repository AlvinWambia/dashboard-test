'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Link as LinkIcon, MoreVertical, Search, Pencil, Trash2, Mail } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/supabase/client";
import { Badge } from "@/components/ui/badge";
import { deleteUser } from '@/app/actions/members';
import { toast } from "sonner";
import EmailModal from "./EmailModal";


const MembersModal = ({ initialUsers = [] }) => {
    const [allUsers, setAllUsers] = useState(initialUsers);
    const [loading, setLoading] = useState(false); // Data is pre-fetched, so no initial loading state
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);



    const displayedUsers = useMemo(() => {
        return allUsers
            .filter(user => {
                if (roleFilter === 'all') return true;
                return user.role === roleFilter;
            })
            .filter(user => {
                if (!searchTerm) return true;
                return user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
            });
    }, [allUsers, searchTerm, roleFilter]);

    const handleDeleteUser = (userId, userName) => {
        toast.warning(`Are you sure you want to delete ${userName}?`, {
            description: "This action is permanent and cannot be undone.",
            action: {
                label: "Delete",
                onClick: async () => {
                    const result = await deleteUser(userId);
                    if (result.success) {
                        setAllUsers(currentUsers => currentUsers.filter(user => user.id !== userId));
                        toast.success(`Successfully deleted ${userName}.`);
                    } else {
                        toast.error(`Failed to delete user: ${result.error}`);
                    }
                },
            },
            cancel: {
                label: "Cancel",
            },
        });
    };

    const getRoleBadgeClass = (role) => {
        switch (role) {
            case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200 capitalize';
            case 'user': return 'bg-blue-100 text-blue-700 border-blue-200 capitalize';
            default: return 'bg-gray-100 text-gray-600 border-gray-200 capitalize';
        }
    };

    return (
        <div className="w-full bg-white rounded-[32px] border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-6 sm:p-8 pb-4">
                <h2 className="text-lg text-slate-900 font-semibold">Members</h2>
            </div>

            <div className="px-5 sm:px-8 pb-6 sm:pb-8 space-y-6">
                {/* Search and Filter Area */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative w-full sm:flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            type="search"
                            placeholder="Search by name..."
                            className="w-full pl-10 border-gray-200 rounded-lg bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select onValueChange={setRoleFilter} defaultValue="all">
                        <SelectTrigger className="w-full sm:w-[180px] border-gray-200 rounded-lg bg-white">
                            <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Shareable Link Banner */}
                <div className="bg-gray-50/60 border border-gray-100 rounded-[24px] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="relative bg-white p-3 rounded-full border border-gray-100 shadow-sm shrink-0 hidden sm:block">
                            <LinkIcon size={20} className="text-slate-600" />
                            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-900 text-sm sm:text-base">Shareable Link is now Live!</h4>
                            <p className="text-xs sm:text-sm text-slate-500">Create and get shareable link for this file.</p>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full sm:w-auto rounded-2xl border-gray-200 font-semibold text-slate-700 bg-white hover:bg-gray-50 shadow-sm">
                        Get Link
                    </Button>
                </div>

                {/* Teammate List */}
                <div className="h-96 space-y-6 overflow-y-auto pt-2 pr-2 sm:pr-4">
                    {loading ? (
                        <p className="text-sm text-slate-500">Loading members...</p>
                    ) : displayedUsers.length > 0 ? (
                        displayedUsers.map((person, idx) => (
                            <div key={person.id} className="flex items-center justify-between group gap-2">
                                <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                                    <Avatar className="h-10 w-10 sm:h-11 sm:w-11 shrink-0 border border-gray-50">
                                        <AvatarImage src={person.avatar_url || `https://avatar.iran.liara.run/public/${idx + 10}`} />
                                        <AvatarFallback>{person.full_name?.[0] || 'U'}</AvatarFallback>
                                    </Avatar>

                                    <div className="min-w-0">
                                        <p className="font-semibold text-slate-900 text-sm sm:text-base leading-none mb-1.5 truncate">{person.full_name}</p>
                                        <p className="text-xs sm:text-sm text-slate-400 font-medium truncate">{person.email}</p>
                                    </div>


                                </div>

                                <div className="flex items-center gap-1 sm:gap-4 shrink-0">
                                    <Badge variant="outline" className={`${getRoleBadgeClass(person.role)} text-[10px] sm:text-xs px-2 py-0.5`}>
                                        {person.role}
                                    </Badge>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 data-[state=open]:bg-muted">
                                                <span className="sr-only">Open menu</span>
                                                <MoreVertical className="h-5 w-5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-[160px]">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onSelect={() => alert(`Edit action for ${person.full_name}`)} disabled={person.role === 'admin'}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onSelect={() => handleDeleteUser(person.id, person.full_name)}
                                                className="text-red-600 focus:bg-red-50 focus:text-red-600"
                                                disabled={person.role === 'admin'}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-black  focus:text-black-600"
                                                onSelect={() => {
                                                    setSelectedUser(person);
                                                    setIsEmailModalOpen(true);
                                                }}
                                            >
                                                <Mail className="mr-2 h-4 w-4" />
                                                Send Email
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-slate-500 text-center py-4">No members found matching your criteria.</p>
                    )}
                </div>
            </div>

            <EmailModal 
                isOpen={isEmailModalOpen} 
                onClose={() => setIsEmailModalOpen(false)} 
                recipient={selectedUser} 
            />
        </div>
    );
};

export default MembersModal;