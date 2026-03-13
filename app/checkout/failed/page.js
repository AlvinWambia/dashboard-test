"use client";

import { XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FailedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-10 text-center">
        <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
        <p className="text-gray-600 mb-8">
          We couldn't process your payment. This could be due to a cancellation or a technical issue. Please try again or contact support if the problem persists.
        </p>

        <div className="space-y-3">
          <Button asChild className="w-full py-6 rounded-2xl bg-black hover:bg-zinc-800">
            <Link href="/home2">Back to Dashboard</Link>
          </Button>
          <Button asChild variant="outline" className="w-full py-6 rounded-2xl">
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
