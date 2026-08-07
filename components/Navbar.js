"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { createClient } from "@/supabase/client"

export default function Navbar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const [userProfile, setUserProfile] = useState(null)

    useEffect(() => {
        const supabase = createClient()
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, role')
                    .eq('id', user.id)
                    .maybeSingle()

                const fullName = profile?.full_name
                    || user.user_metadata?.full_name
                    || user.user_metadata?.name
                    || user.email?.split('@')[0]
                    || "Member"

                setUserProfile({
                    ...profile,
                    full_name: fullName,
                })
            } else {
                setUserProfile(null)
            }
        }
        fetchUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, role')
                    .eq('id', session.user.id)
                    .maybeSingle()

                const fullName = profile?.full_name
                    || session.user.user_metadata?.full_name
                    || session.user.user_metadata?.name
                    || session.user.email?.split('@')[0]
                    || "Member"

                setUserProfile({
                    ...profile,
                    full_name: fullName,
                })
            } else {
                setUserProfile(null)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    if (pathname === "/home")

        return (
            <nav className="w-full border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between items-center h-16">

                        {/* Logo */}
                        <Link href="/" className="text-xl font-bold tracking-tight">
                            myFit
                        </Link>

                        {/* Desktop Links */}
                        <div className="hidden md:flex items-center space-x-8">
                            <Link href="/" className="text-sm font-medium hover:text-blue-600 border-black-200 transition">
                                Home
                            </Link>
                            <Link href="/about" className="text-sm font-medium hover:text-blue-600 border-black-200 transition">
                                About
                            </Link>
                            <Link href="/courses" className="text-sm font-medium hover:text-blue-600 border-black-200 transition">
                                Courses
                            </Link>
                        </div>

                        {/* Auth Buttons */}
                        <div className="hidden md:flex items-center space-x-4">
                            {userProfile ? (
                                <Link
                                    href="/profile"
                                    className="px-4 py-2 text-sm font-medium bg-black text-white rounded-2xl hover:bg-gray-800 transition"
                                >
                                    Welcome {(userProfile.full_name || 'Member').split(' ')[0]}
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/auth/login"
                                        className="text-sm font-medium text-gray-600 hover:text-black transition"
                                    >
                                        Login
                                    </Link>

                                    <Link
                                        href="/auth/signup"
                                        className="px-4 py-2 text-sm font-medium bg-black text-white rounded-2xl hover:bg-gray-800 transition"
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Button */}
                        <button
                            className="md:hidden"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            <div className="space-y-1">
                                <span className="block w-6 h-0.5 bg-black"></span>
                                <span className="block w-6 h-0.5 bg-black"></span>
                                <span className="block w-6 h-0.5 bg-black"></span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden border-t bg-white px-6 py-4 space-y-4">
                        <Link href="/" className="block text-sm font-medium">Home</Link>
                        <Link href="/about" className="block text-sm font-medium">About</Link>
                        <Link href="/courses" className="block text-sm font-medium">Courses</Link>
                        {userProfile ? (
                            <Link
                                href="/profile"
                                className="block px-4 py-2 text-sm font-medium bg-black text-white rounded-2xl text-center"
                            >
                                Welcome {(userProfile.full_name || 'Member').split(' ')[0]}
                            </Link>
                        ) : (
                            <>
                                <Link href="/auth/login" className="block text-sm font-medium">Login</Link>
                                <Link
                                    href="/auth/signup"
                                    className="block px-4 py-2 text-sm font-medium bg-black text-white rounded-2xl text-center"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </nav>
        )
}
