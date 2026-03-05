'use client';

import React, { useRef, useState } from 'react';
import { MessageSquare, Send, MoreVertical, Pencil, Trash2, X, Check } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Field,
    FieldLabel,
} from "@/components/ui/field";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupTextarea,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { addComment, deleteComment, updateComment } from '@/app/admin/members/actions';
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function CommentsSection({ comments = [], currentUser }) {
    const formRef = useRef(null);
    const [editingId, setEditingId] = useState(null);
    const [editBody, setEditBody] = useState("");

    const handleSubmit = async (formData) => {
        const result = await addComment(formData);
        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Comment posted");
            formRef.current?.reset();
        }
    };

    const handleDelete = async (commentId) => {
        const result = await deleteComment(commentId);
        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Comment deleted");
        }
    };

    const startEdit = (comment) => {
        setEditingId(comment.id);
        setEditBody(comment.body);
    };

    const handleUpdate = async () => {
        const formData = new FormData();
        formData.append('commentId', editingId);
        formData.append('body', editBody);
        const result = await updateComment(formData);
        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Comment updated");
            setEditingId(null);
        }
    };

    return (
        <div className="w-150 h-[500px] bg-white rounded-xl flex flex-col">
            <div className="flex justify-between items-center p-8 pb-4">
                <p className="text-lg text-slate-900 font-semibold">Comments</p>
                <Badge variant="outline" className="rounded-full px-4 py-1 bg-white border-slate-200">
                    <MessageSquare className="w-3 h-3 mr-2" /> {comments.length}
                </Badge>
            </div>

            <div className="px-8 pb-4">
                <form ref={formRef} action={handleSubmit}>
                    <Field>
                        <FieldLabel htmlFor="comment-body" className="sr-only">Add Comment</FieldLabel>
                        <InputGroup>
                            <InputGroupTextarea
                                id="comment-body"
                                name="body"
                                placeholder="Write a note..."
                                className="resize-none min-h-[80px]"
                            />
                            <InputGroupAddon align="block-end">
                                <InputGroupButton type="submit" variant="default" size="sm" className="ml-auto">
                                    <Send className="w-4 h-4" />
                                </InputGroupButton>
                            </InputGroupAddon>
                        </InputGroup>
                    </Field>
                </form>
            </div>

            <ScrollArea className="flex-1 px-8 pb-8">
                <div className="space-y-6">
                    {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                            <Avatar className="w-8 h-8">
                                <AvatarImage src={comment.author?.avatar_url} />
                                <AvatarFallback>{comment.author?.full_name?.[0] || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-slate-900">{comment.author?.full_name}</p>
                                    <span className="text-xs text-slate-400">
                                        {new Date(comment.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                {editingId === comment.id ? (
                                    <div className="flex gap-2 items-start mt-1">
                                        <InputGroupTextarea
                                            value={editBody}
                                            onChange={(e) => setEditBody(e.target.value)}
                                            className="min-h-[60px] text-sm"
                                        />
                                        <div className="flex flex-col gap-1">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={handleUpdate}>
                                                <Check className="w-4 h-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-slate-600" onClick={() => setEditingId(null)}>
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-between gap-2 group">
                                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{comment.body}</p>
                                        {currentUser?.id === comment.author_id && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-6 w-6 p-0 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity hover:text-slate-600">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => startEdit(comment)}>
                                                        <Pencil className="w-3.5 h-3.5 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => handleDelete(comment.id)}>
                                                        <Trash2 className="w-3.5 h-3.5 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {comments.length === 0 && (
                        <p className="text-center text-slate-400 text-sm py-4">No comments yet.</p>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}