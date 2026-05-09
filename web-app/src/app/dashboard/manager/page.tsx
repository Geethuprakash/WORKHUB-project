"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Cookies from "js-cookie";
import { FaTasks, FaProjectDiagram, FaUsers, FaClock, FaCalendarCheck, FaLaptop, FaChartLine, FaRocket, FaEnvelope } from "react-icons/fa";
import EnquiryModal from "@/components/EnquiryModal";

interface AssetRequest {
    id: number;
    employee_name: string;
    employee_code: string;
    description: string;
    status: string;
    created_at: string;
}

interface Stats {
    employees: number;
    activeProjects: number;
    pendingTasks: number;
}

const ManagerDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [assetRequests, setAssetRequests] = useState<AssetRequest[]>([]);
    const [enquiries, setEnquiries] = useState<any[]>([]);
    const [attendanceStatus, setAttendanceStatus] = useState<{ checkedIn: boolean, checkedOut: boolean, checkInTime?: string, checkOutTime?: string }>({ checkedIn: false, checkedOut: false });
    const [actionLoading, setActionLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

        const fetchAttendance = async () => {
            try {
                const token = Cookies.get("token");
                const { data } = await api.get("/api/attendance/status", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (data.checkedIn) {
                    setAttendanceStatus({
                        checkedIn: true,
                        checkedOut: !!data.checkOut,
                        checkInTime: data.checkIn,
                        checkOutTime: data.checkOut
                    });
                }
            } catch (error) {
                console.error("Error fetching attendance:", error);
            }
        };

        const fetchRequests = async () => {
            try {
                const token = Cookies.get("token");
                const { data } = await api.get("/api/finance/assets/requests", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setAssetRequests(data);
            } catch (error) {
                console.error("Error fetching asset requests:", error);
            }
        };

        const fetchEnquiries = async () => {
            try {
                const token = Cookies.get("token");
                const { data } = await api.get("/api/enquiries", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setEnquiries(data);
            } catch (error) {
                console.error("Error fetching enquiries:", error);
            }
        };

        if (user) {
            fetchStats();
            fetchAttendance();
            fetchRequests();
            fetchEnquiries();
        }
    }, [user]);

    const handleCheckIn = async () => {
        setActionLoading(true);
        try {
            const token = Cookies.get("token");
            const { data } = await api.post("/api/attendance/check-in", {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAttendanceStatus(prev => ({ ...prev, checkedIn: true, checkInTime: data.time }));
            alert("Signed in successfully for today!");
        } catch (error: any) {
            console.error("Check-in error:", error);
            const msg = error.response?.data?.message || error.message || "Check-in failed";
            alert(`Check-in failed: ${msg}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleCheckOut = async () => {
        setActionLoading(true);
        try {
            const token = Cookies.get("token");
            const { data } = await api.post("/api/attendance/check-out", {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAttendanceStatus(prev => ({ ...prev, checkedOut: true, checkOutTime: data.time }));
            alert("Signed out successfully for today!");
        } catch (error: any) {
            console.error("Check-out error:", error);
            const msg = error.response?.data?.message || error.message || "Check-out failed";
            alert(`Check-out failed: ${msg}`);
        } finally {
            setActionLoading(false);
        }
    };

    if (!user) return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="p-8 bg-white min-h-screen text-slate-800 font-sans">
            <header className="mb-10 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-800">
                        Manager <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Portal</span>
                    </h1>
                    <p className="text-slate-500 mt-2">Welcome back, {user.name}. Here's an overview of your team's progress.</p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 hover:shadow-xl hover:shadow-indigo-500/30 active:scale-95 transition-all"
                >
                    <FaEnvelope /> Send Enquiry
                </button>
            </header>

            <EnquiryModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <Link href="/employees" className="bg-slate-50 shadow-sm border border-slate-100 p-8 rounded-[32px] hover:border-blue-600/30 transition-all group block">
                    <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <FaUsers className="text-blue-600 text-xl" />
                    </div>
                    <h3 className="text-slate-400 font-medium mb-1 uppercase text-[10px] font-black tracking-widest">Team Members</h3>
                    <p className="text-4xl font-black text-slate-800">{stats?.employees || 0}</p>
                </Link>
                <Link href="/tasks" className="bg-slate-50 shadow-sm border border-slate-100 p-8 rounded-[32px] hover:border-purple-600/30 transition-all group block">
                    <div className="w-12 h-12 bg-purple-600/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <FaProjectDiagram className="text-purple-600 text-xl" />
                    </div>
                    <h3 className="text-slate-400 font-medium mb-1 uppercase text-[10px] font-black tracking-widest">Active Projects</h3>
                    <p className="text-4xl font-black text-slate-800">{stats?.activeProjects || 0}</p>
                </Link>
                <Link href="/tasks" className="bg-slate-50 shadow-sm border border-slate-100 p-8 rounded-[32px] hover:border-indigo-600/30 transition-all group block">
                    <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <FaTasks className="text-indigo-600 text-xl" />
                    </div>
                    <h3 className="text-slate-400 font-medium mb-1 uppercase text-[10px] font-black tracking-widest">Pending Tasks</h3>
                    <p className="text-4xl font-black text-slate-800">{stats?.pendingTasks || 0}</p>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-slate-800">
                {/* Attendance Card */}
                <div className="bg-slate-50 shadow-sm border border-slate-100 p-8 rounded-[38px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-indigo-600/5 text-9xl transform translate-x-6 -translate-y-6 group-hover:scale-110 transition-transform duration-500">
                        <FaCalendarCheck />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-2xl font-black mb-8 flex items-center gap-4 text-slate-800">
                            <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                                <FaClock className="text-indigo-500" />
                            </div>
                            Daily <span className="text-slate-400 font-medium">Attendance</span>
                        </h2>
                        
                        <div className="text-center py-6 bg-white/40 rounded-3xl border border-slate-100/50 backdrop-blur-sm">
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-4">Security Status</p>
                            <p className={`text-2xl font-black mb-8 ${attendanceStatus.checkedIn ? (attendanceStatus.checkedOut ? "text-orange-500" : "text-green-500") : "text-red-500"}`}>
                                {attendanceStatus.checkedIn
                                    ? (attendanceStatus.checkedOut
                                        ? `Shift Ended`
                                        : `Active Session`)
                                    : "Offline"}
                            </p>

                            {!attendanceStatus.checkedIn ? (
                                <button
                                    onClick={handleCheckIn}
                                    disabled={actionLoading}
                                    className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 mb-4">
                                    {actionLoading ? "Verifying..." : "Initialize Session"}
                                </button>
                            ) : !attendanceStatus.checkedOut ? (
                                <button
                                    onClick={handleCheckOut}
                                    disabled={actionLoading}
                                    className="px-10 py-4 bg-orange-500 text-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 active:scale-95 mb-4">
                                    {actionLoading ? "Processing..." : "Terminate Session"}
                                </button>
                            ) : (
                                <div className="mx-auto w-fit px-8 py-3 bg-green-600/10 border border-green-600/20 text-green-500 rounded-2xl font-black text-xs uppercase tracking-widest text-center mb-4">
                                    Operational Cycle Complete
                                </div>
                            )}

                            <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em] font-black mt-2">Requires Multi-Factor Auth</p>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Card */}
                <div className="bg-slate-50 shadow-sm border border-slate-100 p-8 rounded-[38px] relative overflow-hidden group">
                    <h2 className="text-2xl font-black mb-8 flex items-center gap-4 text-slate-800">
                        <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                            <FaChartLine className="text-blue-500 text-lg" />
                        </div>
                        Recent <span className="text-slate-400 font-medium">Activity</span>
                    </h2>
                    <div className="space-y-4">
                        {[
                            { text: "Task 'UI Refinement' completed", time: "2 hours ago", color: "blue" },
                            { text: "New employee record added", time: "5 hours ago", color: "indigo" },
                            { text: "System maintenance completed", time: "Yesterday", color: "purple" }
                        ].map((activity, i) => (
                            <div key={i} className="flex gap-4 p-5 rounded-2xl bg-white/50 border border-slate-100 hover:border-slate-200 transition-all group/item">
                                <div className={`w-12 h-12 rounded-xl bg-${activity.color}-600/10 border border-${activity.color}-500/10 flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform`}>
                                    <FaClock className={`text-${activity.color}-500 text-sm`} />
                                </div>
                                <div className="flex flex-col justify-center">
                                    <p className="text-sm font-bold text-slate-800 group-hover/item:text-blue-400 transition-colors">{activity.text}</p>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hardware Requests Card */}
                <div className="lg:col-span-1 bg-slate-50 shadow-sm border border-slate-100 p-8 rounded-[38px] relative overflow-hidden group">
                    <h2 className="text-2xl font-black mb-8 flex items-center gap-4 text-slate-800">
                        <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                            <FaLaptop className="text-blue-500 text-lg" />
                        </div>
                        Inventory <span className="text-slate-400 font-medium">Requests</span>
                    </h2>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                        {assetRequests.length > 0 ? (
                            assetRequests.map((req) => (
                                <div key={req.id} className="p-5 rounded-2xl bg-white/50 border border-slate-100 hover:border-slate-200 transition-all flex justify-between items-center group/item text-slate-800">
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-800 group-hover/item:text-blue-400 transition-colors">{req.description}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{req.employee_name} ({req.employee_code})</p>
                                            <span className="text-gray-700">.</span>
                                            <p className="text-[9px] text-gray-600 font-bold">{new Date(req.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <Link href="/finances" className="text-[9px] font-black uppercase bg-blue-600/10 text-blue-500 border border-blue-500/20 px-3 py-1.5 rounded-full hover:bg-blue-600 hover:text-white transition-all">
                                        Action
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 opacity-20">
                                <FaLaptop className="text-5xl mx-auto mb-4" />
                                <p className="text-xs font-black uppercase tracking-widest">No pending hardware requests</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Enquiries Card */}
                <div className="lg:col-span-1 bg-slate-50 shadow-sm border border-slate-100 p-8 rounded-[38px] relative overflow-hidden group">
                    <h2 className="text-2xl font-black mb-8 flex items-center gap-4 text-slate-800">
                        <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                            <FaEnvelope className="text-indigo-500 text-lg" />
                        </div>
                        Enquiries <span className="text-slate-400 font-medium">Activity</span>
                    </h2>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                        {enquiries.length > 0 ? (
                            enquiries.map((req) => (
                                <div key={req.id} className="p-5 rounded-2xl bg-white/50 border border-slate-100 hover:border-slate-200 transition-all flex justify-between items-center group/item text-slate-800">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-slate-800 group-hover/item:text-blue-400 transition-colors">{req.subject}</p>
                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${req.status === 'RESOLVED' ? 'bg-green-100 text-green-600' : req.status === 'READ' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                                {req.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                                {req.sender_id == (user as any)?._id ? `To: ${req.receiver_role}` : `From: ${req.sender_name || `User #${req.sender_id}`}`}
                                            </p>
                                            <span className="text-gray-700">.</span>
                                            <p className="text-[9px] text-gray-600 font-bold">{new Date(req.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <Link href="/enquiries" className="text-[9px] font-black uppercase bg-indigo-600/10 text-indigo-500 border border-indigo-500/20 px-3 py-1.5 rounded-full hover:bg-indigo-600 hover:text-white transition-all">
                                        View
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 opacity-20">
                                <FaEnvelope className="text-5xl mx-auto mb-4" />
                                <p className="text-xs font-black uppercase tracking-widest">No pending enquiries</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions Card - Full Width */}
                <div className="lg:col-span-2 bg-slate-50 shadow-sm border border-slate-100 p-8 rounded-[38px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-purple-600/5 text-8xl transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
                        <FaRocket />
                    </div>
                    <h2 className="text-2xl font-black mb-8 flex items-center gap-4 text-slate-800 relative z-10">
                        <div className="w-10 h-10 bg-purple-600/10 rounded-xl flex items-center justify-center border border-purple-500/20">
                            <FaRocket className="text-purple-500 text-lg" />
                        </div>
                        Strategic <span className="text-slate-400 font-medium">Controls</span>
                    </h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
                        <Link href="/tasks" className="group/btn relative overflow-hidden p-8 rounded-[32px] bg-indigo-600/5 border border-indigo-500/10 hover:border-indigo-500/40 transition-all text-center flex flex-col items-center justify-center gap-4">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center group-hover/btn:scale-110 transition-transform shadow-lg">
                                <FaTasks className="text-2xl text-indigo-500" />
                            </div>
                            <div className="text-center">
                                <p className="text-slate-800 font-black uppercase tracking-widest text-sm">Manage Tasks</p>
                                <p className="text-[10px] text-slate-400 font-bold mt-1">Direct Operational Output</p>
                            </div>
                        </Link>

                        <Link href="/employees" className="group/btn relative overflow-hidden p-8 rounded-[32px] bg-green-600/5 border border-green-500/10 hover:border-green-500/40 transition-all text-center flex flex-col items-center justify-center gap-4">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center group-hover/btn:scale-110 transition-transform shadow-lg">
                                <FaUsers className="text-2xl text-green-500" />
                            </div>
                            <div className="text-center">
                                <p className="text-slate-800 font-black uppercase tracking-widest text-sm">Manage Team</p>
                                <p className="text-[10px] text-slate-400 font-bold mt-1">Personnel & Logistics</p>
                            </div>
                        </Link>

                        <button onClick={() => setIsModalOpen(true)} className="group/btn relative overflow-hidden p-8 rounded-[32px] bg-blue-600/5 border border-blue-500/10 hover:border-blue-500/40 transition-all text-center flex flex-col items-center justify-center gap-4">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center group-hover/btn:scale-110 transition-transform shadow-lg border">
                                <FaEnvelope className="text-2xl text-blue-500" />
                            </div>
                            <div className="text-center">
                                <p className="text-slate-800 font-black uppercase tracking-widest text-sm">Send Enquiry</p>
                                <p className="text-[10px] text-slate-400 font-bold mt-1">Contact Admin</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;


