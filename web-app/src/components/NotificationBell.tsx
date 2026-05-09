"use client";

import { useState, useEffect } from "react";
import { FaBell } from "react-icons/fa";
import api from "../lib/api";
import { useAuth } from "@/context/AuthContext";

type Notification = {
    id: number;
    type: string;
    message: string;
    is_read: boolean;
    created_at: string;
};

const NotificationBell = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/api/notifications');
            const userNotifs = data.notifications || [];
            
            const anniversaryNotif: Notification = {
                id: 9999,
                type: 'ANNOUNCEMENT',
                message: '🎉 2 ND Anniversary - APRIL 10',
                is_read: false,
                created_at: new Date().toISOString()
            };

            setNotifications([anniversaryNotif, ...userNotifs]);
            setUnreadCount((data.unreadCount || 0) + 1);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    useEffect(() => {
        // Fetch initially
        fetchNotifications();

        // Polling every 1 minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id: number) => {
        try {
            if (id === 9999) {
                setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
                setUnreadCount(Math.max(0, unreadCount - 1));
                return;
            }
            await api.put(`/api/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(Math.max(0, unreadCount - 1));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/api/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    if (user?.role === "SUPER_ADMIN") {
        return null;
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-500 hover:text-indigo-600 transition-colors focus:outline-none"
            >
                <FaBell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 w-80 mt-2 bg-white rounded-3xl shadow-2xl z-50 border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-blue-600">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Alert Center</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-[10px] bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full font-bold transition-all"
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="px-8 py-12 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                    <FaBell className="text-slate-300 text-2xl" />
                                </div>
                                <h4 className="text-sm font-bold text-slate-800 mb-1">No Alerts Detected</h4>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Your feed is currently synchronized.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-50">
                                {notifications.map((notif) => (
                                    <li
                                        key={notif.id}
                                        className={`px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors relative group ${!notif.is_read ? 'bg-indigo-50/30' : ''}`}
                                        onClick={() => !notif.is_read && markAsRead(notif.id)}
                                    >
                                        {!notif.is_read && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600"></div>
                                        )}
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">{notif.type.replace('_', ' ')}</span>
                                            <span className="text-[9px] font-bold text-slate-300 uppercase">
                                                {new Date(notif.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className={`text-xs leading-relaxed ${!notif.is_read ? 'text-slate-900 font-bold' : 'text-slate-600'}`}>
                                            {notif.message}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    {notifications.length > 0 && (
                        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                            <button className="text-[9px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-[0.3em] transition-colors">
                                Persistent History Logs
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
