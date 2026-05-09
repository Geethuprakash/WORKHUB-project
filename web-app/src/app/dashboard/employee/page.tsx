"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Cookies from "js-cookie";
import { FaCheckCircle, FaRegCircle, FaCalendarCheck, FaClock, FaRocket, FaTasks, FaChartLine, FaEnvelope } from "react-icons/fa";
import EnquiryModal from "@/components/EnquiryModal";

interface Task {
    id: number;
    title: string;
    project_title: string;
    is_completed: boolean;
    manager_comment?: string;
}

const EmployeeDashboard = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loadingTasks, setLoadingTasks] = useState(true);
    const [attendanceStatus, setAttendanceStatus] = useState<{ checkedIn: boolean, checkedOut: boolean, checkInTime?: string, checkOutTime?: string }>({ checkedIn: false, checkedOut: false });
    const [actionLoading, setActionLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const token = Cookies.get("token");
                const { data } = await api.get("/api/tasks", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTasks(data);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            } finally {
                setLoadingTasks(false);
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

        if (user) {
            fetchTasks();
            fetchAttendance();
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

    const markComplete = async (taskId: number) => {
        try {
            const token = Cookies.get("token");
            await api.put(`/api/tasks/${taskId}`,
                { is_completed: true },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setTasks(tasks.map(t => t.id === taskId ? { ...t, is_completed: true } : t));
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    if (!user) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="p-8 bg-white min-h-screen text-slate-800 font-sans">
            <header className="mb-12 flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <FaRocket className="text-white" />
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-800">
                            My <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Workspace</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 font-medium ml-16">Focused and productive. What will you accomplish today?</p>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Tasks Section */}
                <div className="lg:col-span-2 bg-slate-50 shadow-sm border border-slate-100 p-8 rounded-[38px] relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-2xl font-black flex items-center gap-4 text-slate-800">
                            <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                                <FaTasks className="text-indigo-500" />
                            </div>
                            Upcoming <span className="text-slate-400 font-medium">Tasks</span>
                        </h2>
                        <span className="px-4 py-1.5 bg-indigo-600/10 border border-indigo-600/20 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {tasks.filter(t => !t.is_completed).length} Pending
                        </span>
                    </div>

                    {loadingTasks ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-8 h-8 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing workflow...</p>
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="text-center py-24 bg-white/50 rounded-[32px] border border-dashed border-slate-100">
                            <FaCheckCircle className="text-indigo-600/20 text-5xl mx-auto mb-4" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Mission Accomplished. No pending tasks.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {tasks.map(task => (
                                <div key={task.id} className={`group/item p-6 rounded-[32px] border transition-all duration-300 ${task.is_completed ? 'bg-green-600/5 border-green-600/10' : 'bg-white/50 border-slate-100 hover:border-indigo-600/30 hover:bg-slate-100/10'}`}>
                                    <div className="flex justify-between items-center">
                                        <div className="flex gap-5">
                                            <div className="mt-1">
                                                {task.is_completed ? (
                                                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                                                        <FaCheckCircle className="text-green-500 text-lg" />
                                                    </div>
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 group-hover/item:border-indigo-500/50 transition-colors">
                                                        <FaRegCircle className="text-gray-600 text-lg group-hover/item:text-indigo-400 transition-colors" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className={`font-black text-lg tracking-tight ${task.is_completed ? 'text-gray-600 line-through' : 'text-slate-800'}`}>{task.title}</h3>
                                                <div className="flex items-center gap-3 mt-1.5">
                                                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest leading-none bg-indigo-600/10 px-3 py-1.5 rounded-lg">{task.project_title}</p>
                                                    {task.manager_comment && <p className="text-[10px] text-slate-400 italic font-medium leading-none">" {task.manager_comment} "</p>}
                                                </div>
                                            </div>
                                        </div>
                                        {!task.is_completed && (
                                            <button
                                                onClick={() => markComplete(task.id)}
                                                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                                                Complete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Attendance & Status */}
                <div className="space-y-8">
                    {/* Attendance Card */}
                    <div className="bg-slate-50 shadow-sm border border-slate-100 p-8 rounded-[38px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 text-blue-600/5 text-9xl transform translate-x-6 -translate-y-6 group-hover:scale-110 transition-transform duration-500">
                            <FaCalendarCheck />
                        </div>
                        <h2 className="text-2xl font-black mb-8 flex items-center gap-4 text-slate-800 relative z-10">
                            <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                                <FaClock className="text-blue-500" />
                            </div>
                            Shift <span className="text-slate-400 font-medium">Status</span>
                        </h2>
                        
                        <div className="text-center py-6 bg-white/40 rounded-3xl border border-slate-100/50 backdrop-blur-sm relative z-10">
                            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-2 font-mono">Telemetry Active</p>
                            <p className={`text-xl font-black mb-6 ${attendanceStatus.checkedIn ? (attendanceStatus.checkedOut ? "text-orange-500" : "text-green-500") : "text-red-500"}`}>
                                {attendanceStatus.checkedIn
                                    ? (attendanceStatus.checkedOut
                                        ? `Termination Confirmed`
                                        : `Active Connection`)
                                    : "Offline Signal"}
                            </p>

                            {!attendanceStatus.checkedIn ? (
                                <button
                                    onClick={handleCheckIn}
                                    disabled={actionLoading}
                                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95 mb-4">
                                    {actionLoading ? "Verifying..." : "Initialize Shift"}
                                </button>
                            ) : !attendanceStatus.checkedOut ? (
                                <button
                                    onClick={handleCheckOut}
                                    disabled={actionLoading}
                                    className="w-full py-4 bg-orange-500 text-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 active:scale-95 mb-4">
                                    {actionLoading ? "Processing..." : "Terminate Shift"}
                                </button>
                            ) : (
                                <div className="w-full py-4 bg-green-600/10 border border-green-600/20 text-green-500 rounded-2xl font-black text-xs uppercase tracking-widest text-center mb-4">
                                    Cycle Concluded
                                </div>
                            )}

                            <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em] font-black mt-2">Location Restricted Access</p>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-slate-50 shadow-sm border border-slate-100 p-8 rounded-[38px] relative overflow-hidden group">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 bg-purple-600/10 rounded-xl flex items-center justify-center border border-purple-500/20">
                                <FaChartLine className="text-purple-500" />
                            </div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Efficiency <span className="text-slate-400">Metrics</span></h3>
                        </div>
                        <div className="space-y-6">
                            {[
                                { label: "Performance", value: "94%", color: "blue" },
                                { label: "Task Yield", value: "100%", color: "purple" },
                                { label: "Engagement", value: "88%", color: "indigo" },
                            ].map((stat, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-[10px] font-black mb-2 uppercase tracking-widest">
                                        <span className="text-slate-400">{stat.label}</span>
                                        <span className={`text-${stat.color}-400`}>{stat.value}</span>
                                    </div>
                                    <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-slate-100/50">
                                        <div className={`h-full bg-gradient-to-r from-${stat.color}-600 to-${stat.color}-400 rounded-full transition-all duration-1000`} style={{ width: stat.value }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;


