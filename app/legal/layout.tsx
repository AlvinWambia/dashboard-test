import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Legal | myFit",
    description: "myFit legal documents including Privacy Policy, Terms of Service, Refund Policy, and more.",
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-white">
            {children}
            <Footer />
        </div>
    );
}
