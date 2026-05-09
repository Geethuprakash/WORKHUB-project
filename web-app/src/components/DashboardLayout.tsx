"use client";

import { usePathname } from "next/navigation";
import Sidebar from "../components/Sidebar";
import { AuthProvider } from "../context/AuthContext";

import NotificationBell from './NotificationBell';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isNoSidebarPage = pathname === "/" || pathname.startsWith("/login") || pathname === "/superadmin-login" || pathname.startsWith("/register");

    return (
        <AuthProvider>
            <div className="flex h-screen bg-slate-50 text-slate-800">
                {!isNoSidebarPage && <Sidebar />}
                <div className="flex-1 flex flex-col h-screen overflow-hidden">
                    {!isNoSidebarPage && (
                        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-end px-8 shrink-0 relative z-10 w-full">
                            <NotificationBell />
                        </header>
                    )}
                    <main className={`flex-1 overflow-y-auto w-full ${!isNoSidebarPage ? 'p-8' : ''}`}>
                        {children}
                    </main>
                </div>
            </div>
        </AuthProvider>
    );
}


