"use client"

import { useState } from "react"
import { createClient } from "@/supabase/client"
import { useRouter } from "next/navigation"
import { Pencil, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ProfileForm({ profile, user }) {
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        full_name: profile.full_name || "",
        username: profile.username || "",
        avatar_url: profile.avatar_url || "",
    })

    const router = useRouter()
    const supabase = createClient()

    // Check if user is registered via email (not OAuth like Google/Github)
    const isEmailUser = user?.app_metadata?.provider === 'email'

    const handleEditToggle = () => {
        if (isEditing) {
            // Reset form on cancel
            setFormData({
                full_name: profile.full_name || "",
                username: profile.username || "",
                avatar_url: profile.avatar_url || "",
            })
        }
        setIsEditing(!isEditing)
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    username: formData.username,
                    avatar_url: formData.avatar_url,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id)

            if (error) throw error

            setIsEditing(false)
            router.refresh() // Refresh server components to show new data
        } catch (error) {
            console.error("Error updating profile:", error)
            alert("Failed to update profile")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="md:col-span-2 md:row-span-2 bg-white">
            <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>Profile</CardTitle>
                {isEmailUser ? (
                    <div>
                        {isEditing ? (
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={handleEditToggle} disabled={loading}>
                                    <X size={16} className="mr-2" /> Cancel
                                </Button>
                                <Button size="sm" onClick={handleSave} disabled={loading} className="bg-black text-white hover:bg-gray-800">
                                    <Save size={16} className="mr-2" /> {loading ? "Saving..." : "Save"}
                                </Button>
                            </div>
                        ) : (
                            <Button variant="outline" size="sm" onClick={handleEditToggle}>
                                <Pencil size={16} className="mr-2" /> Edit Profile
                            </Button>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">
                        Editing is disabled for social logins.
                    </p>
                )}
            </CardHeader>
            <CardContent className="h-auto">
                <div className="flex flex-col gap-6">
                    <div className="flex justify-center md:justify-start">
                        <Avatar className="w-24 h-24">
                            <AvatarImage
                                src={formData.avatar_url || profile.avatar_url}
                                alt="Profile"
                                className="object-cover"
                            />
                            <AvatarFallback>{profile.full_name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Full Name</Label>
                            <Input name="full_name" value={formData.full_name} onChange={handleChange} disabled={!isEditing} placeholder="Full Name" />
                        </div>
                        <div className="grid gap-2">
                            <Label>Username</Label>
                            <Input name="username" value={formData.username || ''} onChange={handleChange} disabled={!isEditing} placeholder="Username" />
                        </div>
                        <div className="grid gap-2">
                            <Label>Email</Label>
                            <Input value={user.email} disabled className="bg-gray-50 text-gray-500" />
                            <p className="text-xs text-gray-500">Email cannot be changed.</p>
                        </div>
                        <div className="grid gap-2">
                            <Label>Membership</Label>
                            <Input value={profile.role} disabled className="bg-gray-50 text-gray-500" />
                            <p className="text-xs text-gray-500">Role is managed by admins.</p>
                        </div>
                        <div className="grid gap-2 md:col-span-2">
                            <Label>Avatar URL</Label>
                            <Input name="avatar_url" value={formData.avatar_url} onChange={handleChange} disabled={!isEditing} placeholder="https://..." />
                            {isEditing && <p className="text-xs text-gray-500">Enter a public URL for your avatar.</p>}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
