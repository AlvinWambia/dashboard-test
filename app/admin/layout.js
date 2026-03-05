// c:\Users\PC\Desktop\dashboard-test\app\admin\layout.js

import { Sidebar } from "@/components/sidebar";

export default function AdminLayout({ children }) {
    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}
