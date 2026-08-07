"use client";

import Link from "next/link";

const legalLinks = [
    { label: "Privacy Policy", href: "/legal/privacy-policy" },
    { label: "Terms of Service", href: "/legal/terms-of-service" },
    { label: "Refund Policy", href: "/legal/refund-policy" },
    { label: "Cancellation Policy", href: "/legal/cancellation-policy" },
    { label: "Health Disclaimer", href: "/legal/health-disclaimer" },
    { label: "Cookie Policy", href: "/legal/cookie-policy" },
];

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="w-full border-t border-gray-100 bg-white font-figtree">
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Top Row */}
                <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-10">
                    {/* Brand */}
                    <div>
                        <Link href="/" className="text-2xl font-bold text-gray-900 tracking-tight">
                            myFit
                        </Link>
                        <p className="mt-2 text-sm text-gray-500 max-w-xs">
                            Your personalized fitness journey. Expert programs, nutrition plans, and a supportive community — all in one place.
                        </p>
                        <p className="mt-3 text-xs text-gray-400 flex items-center gap-1">
                            <span>📍</span> Nairobi, Kenya
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Platform</p>
                        <div className="flex flex-col gap-2">
                            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Home</Link>
                            <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">About</Link>
                            <Link href="/programs" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Programs</Link>
                            <Link href="/nutrition" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Nutrition</Link>
                            <Link href="/wellness" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Wellness</Link>
                        </div>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Legal</p>
                        <div className="flex flex-col gap-2">
                            {legalLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Contact</p>
                        <a
                            href="mailto:myfitrainingg@gmail.com"
                            className="text-sm text-gray-600 hover:text-gray-900 transition-colors block mb-2"
                        >
                            myfitrainingg@gmail.com
                        </a>
                        <p className="text-sm text-gray-500">Nairobi, Kenya</p>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-100 mb-6" />

                {/* Bottom Row */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-gray-400">
                        © {year} myFit. All rights reserved. Governed by the laws of Kenya.
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 justify-center">
                        {legalLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
