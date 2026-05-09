"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Cookies from "js-cookie";
import { FaUsers, FaProjectDiagram, FaTasks, FaPlus, FaChartLine, FaMicrochip, FaShieldAlt, FaCalendarAlt, FaMoneyBillWave } from "react-icons/fa";

interface Stats {
    employees: number;
    activeProjects: number;
    pendingTasks: number;
}

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = Cookies.get("token");
                const { data } = await api.get("/api/dashboard/stats", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setStats(data);
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };

        if (user) fetchStats();
    }, [user]);

    if (!user) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="p-8 bg-white min-h-screen text-slate-800 font-sans">
            <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-800">
                        Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Dashboard</span>
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Organization Overview & Strategic Controls</p>
                </div>
                <div className="bg-slate-50 shadow-sm border border-slate-100 px-6 py-3 rounded-2xl">
                    <p className="text-xs text-slate-400 uppercase font-black tracking-widest leading-none">Status</p>
                    <p className="text-green-400 font-bold flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        System Operational
                    </p>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {[
                    { label: "Total Workforce", value: stats?.employees || 0, icon: <FaUsers />, color: "blue", trend: "+12%", href: "/employees" },
                    { label: "Ongoing Projects", value: stats?.activeProjects || 0, icon: <FaProjectDiagram />, color: "purple", trend: "+5", href: "/tasks" },
                    { label: "Open Tasks", value: stats?.pendingTasks || 0, icon: <FaTasks />, color: "indigo", trend: "Stable", href: "/tasks" },
                ].map((stat, i) => {
                    const styles = {
                        blue: { text: "text-blue-400", bg: "bg-blue-600/10", hover: "hover:border-blue-600/40" },
                        purple: { text: "text-purple-400", bg: "bg-purple-600/10", hover: "hover:border-purple-600/40" },
                        indigo: { text: "text-indigo-400", bg: "bg-indigo-600/10", hover: "hover:border-indigo-600/40" },
                    }[stat.color as 'blue' | 'purple' | 'indigo'];

                    return (
                        <Link href={stat.href} key={i} className={`bg-slate-50 shadow-sm border border-slate-100 p-8 rounded-[32px] transition-all group relative overflow-hidden block ${styles.hover}`}>
                            <div className={`absolute top-0 right-0 p-8 text-slate-400/5 text-6xl transform translate-x-4 -translate-y-4`}>{stat.icon}</div>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${styles.bg}`}>
                                <div className={`text-xl ${styles.text}`}>{stat.icon}</div>
                            </div>
                            <h3 className="text-slate-400 font-semibold mb-1 uppercase text-xs tracking-widest">{stat.label}</h3>
                            <div className="flex items-end gap-3">
                                <p className="text-5xl font-black text-slate-800">{stat.value}</p>
                                <span className={`text-sm font-bold mb-1 ${styles.text}`}>{stat.trend}</span>
                            </div>
                        </Link>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Performance Chart Hub */}
                <div className="lg:col-span-2 bg-slate-50 shadow-sm border border-slate-100 p-8 rounded-[38px] min-h-[400px]">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black flex items-center gap-4 text-slate-800">
                            <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                                <FaChartLine className="text-indigo-400" />
                            </div>
                            Performance <span className="text-slate-400 font-medium">Insights</span>
                        </h2>
                        <div className="flex gap-2">
                            {['7D', '1M', '1Y'].map(t => (
                                <button key={t} className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200 hover:border-indigo-600/50 transition-all">{t}</button>
                            ))}
                        </div>
                    </div>
                    {/* Placeholder for a chart */}
                    <div className="h-64 flex flex-col justify-end gap-6 px-4">
                        <div className="flex items-end gap-3 h-full">
                            {[40, 70, 45, 90, 65, 80, 55, 75, 60, 85].map((h, i) => (
                                <div key={i} className="flex-1 bg-gradient-to-t from-indigo-600/10 to-indigo-500/30 rounded-t-xl transition-all hover:to-blue-400/50 cursor-pointer group relative" style={{ height: `${h}%` }}>
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-xl">{h}% Efficiency</div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 font-black tracking-widest px-2 group">
                            <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
                        </div>
                    </div>
                </div>

                {/* Strategic Hub */}
                <div className="bg-slate-50 shadow-sm border border-slate-100 p-8 rounded-[38px] flex flex-col">
                    <h2 className="text-2xl font-black mb-8 text-slate-800 flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                            <FaProjectDiagram className="text-blue-500" />
                        </div>
                        Strategic <span className="text-slate-400 font-medium">Hub</span>
                    </h2>
                    <div className="space-y-4 flex-1">
                        <Link href="/employees" className="group/btn w-full flex items-center justify-between p-6 rounded-3xl bg-blue-600/5 border border-blue-500/10 hover:border-blue-500/40 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                                    <FaPlus className="text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Recruit Member</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Personnel Logistics</p>
                                </div>
                            </div>
                        </Link>
                        <Link href="/tasks" className="group/btn w-full flex items-center justify-between p-6 rounded-3xl bg-purple-600/5 border border-purple-500/10 hover:border-purple-500/40 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                                    <FaProjectDiagram className="text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Create Project</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Strategic Alignment</p>
                                </div>
                            </div>
                        </Link>
                        <Link href="/finances" className="group/btn w-full flex items-center justify-between p-6 rounded-3xl bg-green-600/5 border border-green-500/10 hover:border-green-500/40 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                                    <FaMoneyBillWave className="text-green-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Capital Assets</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Financial Equilibrium</p>
                                </div>
                            </div>
                        </Link>
                        <Link href="/finances?tab=bonuses" className="group/btn w-full flex items-center justify-between p-6 rounded-3xl bg-indigo-600/5 border border-indigo-500/10 hover:border-indigo-500/40 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                                    <FaChartLine className="text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Performance Rewards</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Incentives Ledger</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* System Info & Activity */}
                <div className="bg-slate-50 shadow-sm border border-slate-100 p-8 rounded-[32px] flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center">
                            <FaMicrochip className="text-sm" />
                        </div>
                        <h3 className="font-bold text-slate-800">System Info</h3>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tenant ID</h4>
                            <p className="font-bold text-sm text-slate-800">{user?.tenant_code || "TEST001"}</p>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Active Role</h4>
                            <div className="flex items-center gap-2">
                                <FaShieldAlt className="text-indigo-400 text-[10px]" />
                                <span className="font-bold text-sm text-slate-800 capitalize">{user?.role?.toLowerCase() || "Admin"}</span>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Today's Date</h4>
                            <div className="flex items-center gap-2">
                                <FaCalendarAlt className="text-indigo-400 text-[10px]" />
                                <span className="font-bold text-sm text-slate-800">
                                    {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-slate-100/80"></div>
                        <span className="flex-shrink-0 mx-4 text-[10px] text-slate-400 font-black tracking-widest uppercase">Activity</span>
                        <div className="flex-grow border-t border-slate-100/80"></div>
                    </div>

                    <div className="space-y-3 mt-6">
                        <div className="p-4 rounded-xl bg-white/50 border-l-4 border-green-500 hover:bg-slate-100 transition-all cursor-default">
                            <div className="flex justify-between items-start mb-1.5">
                                <span className="text-xs font-bold text-slate-800">Payroll Status</span>
                                <span className="text-[10px] text-slate-400 font-medium">Now</span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed">Successfully generated for current month.</p>
                        </div>

                        <div className="p-4 rounded-xl bg-white/50 border-l-4 border-yellow-500 hover:bg-slate-100 transition-all cursor-default">
                            <div className="flex justify-between items-start mb-1.5">
                                <span className="text-xs font-bold text-slate-800">Leave Requests</span>
                                <span className="text-[10px] text-slate-400 font-medium">1h ago</span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed">2 requests are pending approval.</p>
                        </div>

                        <div className="p-4 rounded-xl bg-white/50 border-l-4 border-red-500 hover:bg-slate-100 transition-all cursor-default">
                            <div className="flex justify-between items-start mb-1.5">
                                <span className="text-xs font-bold text-slate-800">Attendance</span>
                                <span className="text-[10px] text-slate-400 font-medium">Yesterday</span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed">Missing logs detected in System B.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;


