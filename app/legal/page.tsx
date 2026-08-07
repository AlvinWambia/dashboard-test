import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Legal Documents | myFit",
    description: "myFit's legal documents — Privacy Policy, Terms of Service, Refund Policy, Cancellation Policy, Health Disclaimer, and Cookie Policy.",
};

const docs = [
    {
        title: "Privacy Policy",
        description: "How we collect, use, and protect your personal data.",
        href: "/legal/privacy-policy",
        icon: "🔒",
        accent: "#3b82f6",
        updated: "August 5, 2026",
    },
    {
        title: "Terms of Service",
        description: "The rules and conditions governing your use of our platform.",
        href: "/legal/terms-of-service",
        icon: "📋",
        accent: "#8b5cf6",
        updated: "August 5, 2026",
    },
    {
        title: "Refund Policy",
        description: "Our fair and transparent policy on refunds for programs and products.",
        href: "/legal/refund-policy",
        icon: "💳",
        accent: "#10b981",
        updated: "August 5, 2026",
    },
    {
        title: "Cancellation Policy",
        description: "How to cancel your subscription and what happens to your access.",
        href: "/legal/cancellation-policy",
        icon: "🚫",
        accent: "#f59e0b",
        updated: "August 5, 2026",
    },
    {
        title: "Health Disclaimer",
        description: "Important health and safety information before starting any program.",
        href: "/legal/health-disclaimer",
        icon: "❤️‍🩹",
        accent: "#ef4444",
        updated: "August 5, 2026",
    },
    {
        title: "Cookie Policy",
        description: "How we use cookies and tracking technologies on our site.",
        href: "/legal/cookie-policy",
        icon: "🍪",
        accent: "#06b6d4",
        updated: "August 5, 2026",
    },
];

export default function LegalIndexPage() {
    return (
        <div className="min-h-screen bg-[#fafafa] font-figtree">
            {/* Hero */}
            <div
                className="relative overflow-hidden"
                style={{
                    background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 60%, #16213e 100%)",
                }}
            >
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
                        backgroundSize: "32px 32px",
                    }}
                />
                <div className="relative max-w-4xl mx-auto px-6 py-24 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/70 text-sm border border-white/10 mb-8">
                        📍 myFit, Nairobi, Kenya
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-5">Legal Documents</h1>
                    <p className="text-xl text-white/60 max-w-2xl mx-auto mb-8">
                        We believe in full transparency. Everything you need to know about your rights,
                        our obligations, and how we operate — all in one place.
                    </p>
                    <p className="text-sm text-white/40">
                        All documents effective as of August 5, 2026 · Governed by the laws of Kenya
                    </p>
                </div>
            </div>

            {/* Cards Grid */}
            <div className="max-w-5xl mx-auto px-6 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {docs.map((doc) => (
                        <Link
                            key={doc.href}
                            href={doc.href}
                            className="group block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                        >
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 transition-transform group-hover:scale-110"
                                style={{ background: `${doc.accent}15`, border: `1.5px solid ${doc.accent}30` }}
                            >
                                {doc.icon}
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-black transition-colors">
                                {doc.title}
                            </h2>
                            <p className="text-sm text-gray-500 mb-4 leading-relaxed">{doc.description}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400">Updated {doc.updated}</span>
                                <span
                                    className="text-sm font-semibold transition-colors"
                                    style={{ color: doc.accent }}
                                >
                                    Read →
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Contact Section */}
                <div className="mt-16 rounded-3xl bg-white border border-gray-200 p-10 text-center shadow-sm">
                    <div className="text-4xl mb-4">✉️</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Have a legal question?</h2>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        If you have any concerns, requests, or questions about any of our legal documents,
                        our team is here to help.
                    </p>
                    <a
                        href="mailto:myfitrainingg@gmail.com"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-black transition-all hover:shadow-lg"
                    >
                        myfitrainingg@gmail.com →
                    </a>
                </div>
            </div>


        </div>
    );
}
