import type { Metadata } from "next";
import Navbar from "@/components/Navbar"
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "myfit | Your Fitness Revolution",
  description: "Join myFit and start your personalized fitness journey today. Expert programs, nutrition plans, and a supportive community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="font-figtree antialiased"
      >
        <Navbar />
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
