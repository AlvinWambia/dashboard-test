"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Section {
    id: string;
    title: string;
    content: React.ReactNode;
}

interface LegalPageProps {
    title: string;
    subtitle: string;
    effectiveDate: string;
    lastUpdated: string;
    accentColor: string;
    icon: string;
    sections: Section[];
}

export default function LegalPage({
    title,
    subtitle,
    effectiveDate,
    lastUpdated,
    accentColor,
    icon,
    sections,
}: LegalPageProps) {
    const [activeSection, setActiveSection] = useState<string>("");
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 80);

            // Find active section
            const sectionEls = sections.map((s) => document.getElementById(s.id));
            let current = sections[0]?.id || "";
            for (const el of sectionEls) {
                if (el && el.getBoundingClientRect().top <= 120) {
                    current = el.id;
                }
            }
            setActiveSection(current);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, [sections]);

    return (
        <div className="min-h-screen bg-[#fafafa] font-figtree">
            {/* Hero Header */}
            <div
                className="relative overflow-hidden"
                style={{
                    background: `linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 60%, #16213e 100%)`,
                }}
            >
                {/* Decorative grid */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
                        backgroundSize: "32px 32px",
                    }}
                />
                {/* Glow orb */}
                <div
                    className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20"
                    style={{ background: accentColor }}
                />

                <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-white/50 mb-8">
                        <Link href="/" className="hover:text-white/80 transition-colors">
                            Home
                        </Link>
                        <span>/</span>
                        <span className="text-white/70">Legal</span>
                        <span>/</span>
                        <span className="text-white/90">{title}</span>
                    </div>

                    {/* Icon badge */}
                    <div
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 text-3xl shadow-lg"
                        style={{ background: `${accentColor}22`, border: `1.5px solid ${accentColor}44` }}
                    >
                        {icon}
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                        {title}
                    </h1>
                    <p className="text-lg text-white/60 max-w-2xl mb-8">{subtitle}</p>

                    {/* Meta chips */}
                    <div className="flex flex-wrap gap-3">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/70 text-sm border border-white/10">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                            Effective: {effectiveDate}
                        </span>
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/70 text-sm border border-white/10">
                            🕐 Last updated: {lastUpdated}
                        </span>
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/70 text-sm border border-white/10">
                            📍 Governed by Kenyan Law
                        </span>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="max-w-6xl mx-auto px-6 py-16">
                <div className="flex gap-12">
                    {/* Sidebar TOC — sticky */}
                    <aside className="hidden lg:block w-72 shrink-0">
                        <div className="sticky top-24">
                            <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-4">
                                On This Page
                            </p>
                            <nav className="flex flex-col gap-1">
                                {sections.map((s) => (
                                    <a
                                        key={s.id}
                                        href={`#${s.id}`}
                                        className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200"
                                        style={{
                                            background:
                                                activeSection === s.id
                                                    ? `${accentColor}15`
                                                    : "transparent",
                                            color:
                                                activeSection === s.id
                                                    ? accentColor
                                                    : "#6b7280",
                                            fontWeight: activeSection === s.id ? 600 : 400,
                                        }}
                                    >
                                        <span
                                            className="w-1.5 h-1.5 rounded-full shrink-0 transition-all"
                                            style={{
                                                background:
                                                    activeSection === s.id
                                                        ? accentColor
                                                        : "#d1d5db",
                                            }}
                                        />
                                        {s.title}
                                    </a>
                                ))}
                            </nav>

                            {/* Back to top */}
                            {scrolled && (
                                <button
                                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                                    className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all"
                                >
                                    ↑ Back to top
                                </button>
                            )}
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        <div className="space-y-16">
                            {sections.map((section, i) => (
                                <section key={section.id} id={section.id} className="scroll-mt-24">
                                    {/* Section header */}
                                    <div className="flex items-center gap-4 mb-6">
                                        <span
                                            className="flex items-center justify-center w-9 h-9 rounded-xl text-sm font-bold text-white shrink-0"
                                            style={{ background: accentColor }}
                                        >
                                            {i + 1}
                                        </span>
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            {section.title}
                                        </h2>
                                    </div>
                                    {/* Section content */}
                                    <div className="prose prose-gray max-w-none legal-content pl-13">
                                        {section.content}
                                    </div>
                                    {/* Divider */}
                                    {i < sections.length - 1 && (
                                        <div className="mt-12 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                                    )}
                                </section>
                            ))}
                        </div>

                        {/* Contact Card */}
                        <div
                            className="mt-20 rounded-3xl p-8 border"
                            style={{
                                background: `linear-gradient(135deg, ${accentColor}08, ${accentColor}15)`,
                                borderColor: `${accentColor}30`,
                            }}
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                                    style={{ background: `${accentColor}20` }}
                                >
                                    ✉️
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                                        Questions about this policy?
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-4">
                                        If you have any questions, concerns, or requests regarding this
                                        policy, please don&apos;t hesitate to reach out to our team.
                                    </p>
                                    <a
                                        href="mailto:myfitrainingg@gmail.com"
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-md"
                                        style={{ background: accentColor }}
                                    >
                                        myfitrainingg@gmail.com →
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Other Legal Docs */}
                        <div className="mt-8 pt-8 border-t border-gray-100">
                            <p className="text-sm text-gray-500 mb-4 font-medium">Other Legal Documents</p>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { label: "Privacy Policy", href: "/legal/privacy-policy" },
                                    { label: "Terms of Service", href: "/legal/terms-of-service" },
                                    { label: "Refund Policy", href: "/legal/refund-policy" },
                                    { label: "Cancellation Policy", href: "/legal/cancellation-policy" },
                                    { label: "Health Disclaimer", href: "/legal/health-disclaimer" },
                                    { label: "Cookie Policy", href: "/legal/cookie-policy" },
                                ].map((doc) => (
                                    <Link
                                        key={doc.href}
                                        href={doc.href}
                                        className="px-4 py-1.5 rounded-full text-sm text-gray-600 border border-gray-200 hover:border-gray-400 hover:text-gray-900 transition-all"
                                    >
                                        {doc.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </main>
                </div>
            </div>



            <style>{`
                .legal-content p {
                    color: #374151;
                    line-height: 1.8;
                    margin-bottom: 1rem;
                }
                .legal-content ul {
                    list-style: disc;
                    padding-left: 1.5rem;
                    color: #374151;
                    line-height: 1.8;
                    margin-bottom: 1rem;
                }
                .legal-content ul li {
                    margin-bottom: 0.4rem;
                }
                .legal-content ol {
                    list-style: decimal;
                    padding-left: 1.5rem;
                    color: #374151;
                    line-height: 1.8;
                    margin-bottom: 1rem;
                }
                .legal-content strong {
                    color: #111827;
                    font-weight: 600;
                }
                .legal-content h3 {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #111827;
                    margin-top: 1.5rem;
                    margin-bottom: 0.6rem;
                }
                .legal-content a {
                    color: #3b82f6;
                    text-decoration: underline;
                }
                .legal-content .highlight-box {
                    background: #f3f4f6;
                    border-left: 4px solid #e5e7eb;
                    padding: 1rem 1.25rem;
                    border-radius: 0 12px 12px 0;
                    margin: 1rem 0;
                }
                .pl-13 {
                    padding-left: 3.25rem;
                }
            `}</style>
        </div>
    );
}
