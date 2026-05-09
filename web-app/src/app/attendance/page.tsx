"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Cookies from "js-cookie";
import Link from "next/link";
import { FaCalendarAlt, FaPaperPlane, FaChartPie, FaCheckCircle, FaExclamationCircle, FaUserClock, FaHistory, FaCheck, FaTimes, FaUserTie, FaUsers } from "react-icons/fa";

interface LeaveBalance {
    leave_type: string;
    balance: number;
}

interface Employee {
    id: number;
    employee_code: string;
    display_name: string;
    email: string;
    designation: string;
    role?: string;
}

interface LeaveRequest {
    id: number;
    display_name: string;
    employee_code: string;
    leave_type: string;
    days: number;
    reason: string;
    status: string;
    created_at: string;
}

interface AttendanceRecord {
    id: number;
    display_name: string;
    employee_code: string;
    designation: string;
    check_in: string;
    check_out: string | null;
    status: string;
    date: string;
}

const AttendancePage = () => {
    const { user } = useAuth();
    const [balance, setBalance] = useState<LeaveBalance[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>([]);
    const [myRequests, setMyRequests] = useState<LeaveRequest[]>([]);
    const [myAttendance, setMyAttendance] = useState<AttendanceRecord[]>([]);
    const [leaveType, setLeaveType] = useState("CL");
    const [days, setDays] = useState(1);
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState(() => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });

    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);

    const fetchEmployeeDetails = async (empId: number) => {
        try {
            const token = Cookies.get("token");
            const headers = { Authorization: `Bearer ${token}` };
            const [balRes, attRes] = await Promise.all([
                api.get(`/api/leaves/balance?employeeId=${empId}`, { headers }),
                api.get(`/api/attendance/my-history?employeeId=${empId}`, { headers })
            ]);
            setBalance(balRes.data || []);
            setMyAttendance(attRes.data || []);
        } catch (error) {
            console.error("Failed to fetch employee details", error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = Cookies.get("token");
            const headers = { Authorization: `Bearer ${token}` };

            if (user?.role === 'EMPLOYEE') {
                const [balRes, reqRes, attRes] = await Promise.all([
                    api.get("/api/leaves/balance", { headers }),
                    api.get("/api/leaves/my-requests", { headers }),
                    api.get("/api/attendance/my-history", { headers })
                ]);
                setBalance(balRes.data);
                setMyRequests(reqRes.data);
                setMyAttendance(attRes.data);
            } else if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
                const [leavesRes, attendanceRes, empRes, myReqRes] = await Promise.all([
                    api.get("/api/leaves/all", { headers }),
                    api.get(`/api/attendance/today?date=${selectedDate}`, { headers }),
                    api.get("/api/employees", { headers }),
                    api.get("/api/leaves/my-requests", { headers }),
                ]);
                setLeaveRequests(leavesRes.data || []);
                setTodayAttendance(attendanceRes.data || []);
                const empData = empRes.data || [];
                setEmployees(empData);
                setMyRequests(myReqRes.data || []);

                if (empData.length > 0 && !selectedEmployeeId) {
                    setSelectedEmployeeId(empData[0].id);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user, selectedDate]);

    const handleSelectEmployee = (empId: number) => {
        setSelectedEmployeeId(empId);
        // Not fetching details anymore for Admin/Manager as they are being removed
    };

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = Cookies.get("token");
            await api.post("/api/leaves/apply", { leave_type: leaveType, days, reason }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("Leave applied successfully");
            fetchData();
            setReason(""); setDays(1);
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || "Failed to apply");
        }
    };

    const handleCancelLeave = async (id: number) => {
        if (!confirm("Are you sure you want to cancel?")) return;
        try {
            const token = Cookies.get("token");
            await api.delete(`/api/leaves/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchData();
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || "Failed to cancel");
        }
    };

    const handleLeaveAction = async (id: number, status: string) => {
        setActionLoading(id);
        try {
            const token = Cookies.get("token");
            await api.put(`/api/leaves/${id}`, { status, manager_comment: "Processed" }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchData();
        } catch (error) {
            console.error(error);
            alert("Failed to update");
        } finally {
            setActionLoading(null);
        }
    };

    if (!user) return null;

    const isAdminOrManager = user.role === 'ADMIN' || user.role === 'MANAGER';

    return (
        <div className="p-8 bg-white min-h-screen text-slate-800 font-sans">
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-800">
                        Attendance <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Portal</span>
                    </h1>
                    <p className="text-slate-500 mt-2">Monitor workforce mobility and leave authorizations.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
                {/* Left Column: Stats & History (ONLY FOR EMPLOYEES) */}
                {user.role === 'EMPLOYEE' && (
                    <div className="lg:col-span-4 space-y-8">
                        {/* Leave Pool */}
                        <div className="bg-slate-50 shadow-sm border border-slate-100 p-8 rounded-[32px] relative overflow-hidden group">
                            <div className="mb-6">
                                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                    <FaChartPie className="text-indigo-600" />
                                    Leave Pool
                                </h2>
                            </div>
                            <div className="space-y-6">
                                {Array.from(new Map(balance.map(b => [b.leave_type, b])).values()).map((b, i) => (
                                    <div key={i} className="flex justify-between items-center bg-white/50 p-4 rounded-2xl border border-slate-100">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</p>
                                            <p className="text-lg font-bold text-slate-800 mt-1">{b.leave_type}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-indigo-400">{b.balance}</p>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Days Left</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Timesheet */}
                        <div className="bg-slate-50 shadow-sm border border-slate-100 p-8 rounded-[32px] relative overflow-hidden group">
                            <div className="mb-6">
                                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                    <FaHistory className="text-blue-600" />
                                    Timesheet
                                </h2>
                            </div>
                            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 scrollbar-hide">
                                {myAttendance.map((a) => (
                                    <div key={a.id} className="p-4 rounded-2xl bg-white/50 border border-slate-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{new Date(a.date).toLocaleDateString()}</p>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{a.check_in} - {a.check_out || 'Ongoing'}</p>
                                        </div>
                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded border ${a.status === 'PRESENT' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                            {a.status}
                                        </span>
                                    </div>
                                ))}
                                {myAttendance.length === 0 && !loading && (
                                    <div className="text-center py-10 text-slate-400">
                                        <FaUserClock className="text-3xl mx-auto mb-3 opacity-20" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest">No activity found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Right Column: Dynamic Content */}
                <div className={user.role === 'EMPLOYEE' ? "lg:col-span-8" : "lg:col-span-12"}>
                    {user.role === 'ADMIN' ? (
                        /* ADMIN VIEW */
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            {/* Team Roster */}
                            <div className="bg-slate-50 shadow-sm border border-slate-100 p-8 rounded-[32px] relative overflow-hidden min-h-[500px]">
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                        <FaUserClock className="text-green-600" />
                                        Team Roster
                                    </h2>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="bg-white text-slate-800 text-xs font-bold px-4 py-3 rounded-xl border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-2 max-h-[600px] scrollbar-hide">
                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Management</h3>
                                        {employees.filter(e => e.role === 'MANAGER').map(emp => {
                                            const a = todayAttendance.find(att => att.employee_code === emp.employee_code);
                                            return (
                                                <div key={emp.id} className="p-4 rounded-2xl bg-white/50 border border-slate-100 flex items-center gap-4 hover:border-indigo-600/30 transition-all">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-indigo-400 border border-slate-200">{emp.display_name[0]}</div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-slate-800">{emp.display_name}</p>
                                                        <p className="text-[10px] text-slate-400 uppercase font-black">{emp.designation}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        {a ? (
                                                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${a.check_out ? 'bg-orange-500/10 text-orange-400' : 'bg-green-500/10 text-green-400'}`}>{a.check_out ? 'Out' : 'In'}</span>
                                                        ) : (
                                                            <span className="text-[9px] font-black uppercase px-2 py-1 rounded bg-slate-100 text-slate-400 border border-slate-200">Absent</span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">Workforce</h3>
                                        {employees.filter(e => e.role === 'EMPLOYEE').map(emp => {
                                            const a = todayAttendance.find(att => att.employee_code === emp.employee_code);
                                            return (
                                                <div key={emp.id} className="p-4 rounded-2xl bg-white/50 border border-slate-100 flex items-center gap-4 hover:border-blue-600/30 transition-all">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-blue-400 border border-slate-200">{emp.display_name[0]}</div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-slate-800">{emp.display_name}</p>
                                                        <p className="text-[10px] text-slate-400 uppercase font-black">{emp.designation}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        {a ? (
                                                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${a.check_out ? 'bg-orange-500/10 text-orange-400' : 'bg-green-500/10 text-green-400'}`}>{a.check_out ? 'Out' : 'In'}</span>
                                                        ) : (
                                                            <span className="text-[9px] font-black uppercase px-2 py-1 rounded bg-slate-100 text-slate-400 border border-slate-200">Absent</span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Leave Approvals (Admin) */}
                            <div className="bg-slate-50 shadow-sm border border-slate-100 p-8 rounded-[32px]">
                                <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
                                    <FaCheckCircle className="text-indigo-600" />
                                    System Approvals
                                </h2>
                                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                                    {leaveRequests.filter(req => req.status === 'PENDING').map(req => (
                                        <div key={req.id} className="p-5 rounded-2xl bg-white/50 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-600/10 flex items-center justify-center font-bold text-indigo-400 text-xs">{req.display_name[0]}</div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">{req.display_name} <span className="text-xs text-slate-400 font-medium tracking-tight">({req.employee_code})</span></p>
                                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{req.leave_type} Leave - {req.days} Days</p>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-500 pl-11">"{req.reason}"</p>
                                            </div>
                                            <div className="flex items-center gap-3 md:pl-4 md:border-l border-slate-100">
                                                <button onClick={() => handleLeaveAction(req.id, 'APPROVED')} className="px-4 py-2 bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white rounded-xl text-[10px] font-black uppercase transition-all">Approve</button>
                                                <button onClick={() => handleLeaveAction(req.id, 'REJECTED')} className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl text-[10px] font-black uppercase transition-all">Reject</button>
                                            </div>
                                        </div>
                                    ))}
                                    {leaveRequests.filter(req => req.status === 'PENDING').length === 0 && <p className="text-center py-10 text-slate-400 italic">No pending applications.</p>}
                                </div>
                            </div>
                        </div>
                    ) : user.role === 'MANAGER' ? (
                        /* MANAGER VIEW */
                        <div className="space-y-10">
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                {/* Team Roster (Staff Only) */}
                                <div className="bg-slate-50 shadow-sm border border-slate-100 p-8 rounded-[32px] relative overflow-hidden min-h-[500px]">
                                    <div className="flex justify-between items-center mb-8">
                                        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                            <FaUsers className="text-blue-600" />
                                            Active Staff
                                        </h2>
                                        <input
                                            type="date"
                                            value={selectedDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            className="bg-white text-slate-800 text-xs font-bold px-4 py-3 rounded-xl border border-slate-100 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-4 overflow-y-auto pr-2 max-h-[600px] scrollbar-hide">
                                        {employees.filter(e => e.role === 'EMPLOYEE').map(emp => {
                                            const a = todayAttendance.find(att => att.employee_code === emp.employee_code);
                                            return (
                                                <div key={emp.id} className="p-4 rounded-2xl bg-white/50 border border-slate-100 flex items-center gap-4 hover:border-blue-600/30 transition-all">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-blue-400 border border-slate-200">{emp.display_name[0]}</div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-slate-800">{emp.display_name}</p>
                                                        <p className="text-[10px] text-slate-400 uppercase font-black">{emp.designation}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        {a ? (
                                                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${a.check_out ? 'bg-orange-500/10 text-orange-400' : 'bg-green-500/10 text-green-400'}`}>{a.check_out ? 'Out' : 'In'}</span>
                                                        ) : (
                                                            <span className="text-[9px] font-black uppercase px-2 py-1 rounded bg-slate-100 text-slate-400 border border-slate-200">Absent</span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Leave Approvals (Staff only, exclude self) */}
                                <div className="bg-slate-50 shadow-sm border border-slate-100 p-8 rounded-[32px]">
                                    <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
                                        <FaCheckCircle className="text-indigo-600" />
                                        Workforce Approvals
                                    </h2>
                                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                                        {leaveRequests
                                            .filter(req => req.status === 'PENDING' && req.display_name !== user?.name)
                                            .map(req => (
                                                <div key={req.id} className="p-5 rounded-2xl bg-white/50 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="w-8 h-8 rounded-full bg-indigo-600/10 flex items-center justify-center font-bold text-indigo-400 text-xs">{req.display_name[0]}</div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-800">{req.display_name} <span className="text-xs text-slate-400 font-medium tracking-tight">({req.employee_code})</span></p>
                                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{req.leave_type} Leave - {req.days} Days</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-slate-500 pl-11">"{req.reason}"</p>
                                                    </div>
                                                    <div className="flex items-center gap-3 md:pl-4 md:border-l border-slate-100">
                                                        <button onClick={() => handleLeaveAction(req.id, 'APPROVED')} className="px-4 py-2 bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white rounded-xl text-[10px] font-black uppercase transition-all">Approve</button>
                                                        <button onClick={() => handleLeaveAction(req.id, 'REJECTED')} className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl text-[10px] font-black uppercase transition-all">Reject</button>
                                                    </div>
                                                </div>
                                            ))}
                                        {leaveRequests.filter(req => req.status === 'PENDING' && req.display_name !== user?.name).length === 0 && <p className="text-center py-10 text-slate-400 italic">No pending applications.</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Self Request Form (For Manager) */}
                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                                <div className="xl:col-span-7 bg-slate-50 shadow-sm border border-slate-100 p-10 rounded-[40px] relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                                    <h2 className="text-3xl font-black text-slate-800 mb-8">Personal <span className="text-blue-600">Leave Application</span></h2>
                                    <form onSubmit={handleApply} className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Leave Type</label>
                                                <select value={leaveType} onChange={e => setLeaveType(e.target.value)} className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-6 text-slate-800 outline-none focus:ring-2 focus:ring-blue-600/20 appearance-none">
                                                    <option value="CL">Casual Leave (CL)</option>
                                                    <option value="SL">Sick Leave (SL)</option>
                                                    <option value="PL">Privilege Leave (PL)</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duration (Days)</label>
                                                <input type="number" min="1" value={days} onChange={e => setDays(Number(e.target.value))} className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-6 text-slate-800 outline-none focus:ring-2 focus:ring-blue-600/20" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason</label>
                                            <textarea placeholder="Describe reason..." value={reason} onChange={e => setReason(e.target.value)} rows={4} className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-6 text-slate-800 resize-none outline-none focus:ring-2 focus:ring-blue-600/20" required></textarea>
                                        </div>
                                        <button type="submit" disabled={loading} className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-500 disabled:opacity-50 transition-all shadow-xl shadow-blue-600/20">Submit to Admin</button>
                                    </form>
                                </div>
                                <div className="xl:col-span-5 bg-slate-50 shadow-sm border border-slate-100 p-8 rounded-[32px]">
                                    <h3 className="text-xl font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100 flex justify-between items-center">
                                        My Requests
                                        <span className="text-[10px] font-black bg-blue-600/10 text-blue-400 px-3 py-1 rounded-full uppercase">{myRequests.length}</span>
                                    </h3>
                                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                                        {myRequests.length > 0 ? (
                                            myRequests.map(req => (
                                                <div key={req.id} className="p-5 rounded-2xl border border-slate-100 bg-white/50 flex justify-between items-center group/item hover:border-slate-200 transition-all">
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">{req.leave_type} Leave ({req.days} Days)</p>
                                                        <p className="text-xs text-slate-400 italic mt-1">"{req.reason}"</p>
                                                        <p className="text-[9px] text-gray-600 mt-2 font-black uppercase tracking-widest">{new Date(req.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${req.status === 'PENDING' ? 'text-orange-400 bg-orange-400/10' : req.status === 'APPROVED' ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>{req.status}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-10 opacity-30 grayscale contrast-125">
                                                <FaPaperPlane className="text-3xl mx-auto mb-3" />
                                                <p className="text-[10px] font-black uppercase tracking-wider">No personal history</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* EMPLOYEE VIEW */
                        <div className="space-y-8">
                            <div className="bg-slate-50 shadow-sm border border-slate-100 p-10 rounded-[40px] relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 to-blue-600"></div>
                                <h2 className="text-3xl font-black text-slate-800 mb-8">Apply for <span className="text-indigo-600">Leave</span></h2>
                                <form onSubmit={handleApply} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Leave Type</label>
                                            <select value={leaveType} onChange={e => setLeaveType(e.target.value)} className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-6 text-slate-800 appearance-none focus:ring-2 focus:ring-indigo-600/20">
                                                <option value="CL">Casual Leave (CL)</option>
                                                <option value="SL">Sick Leave (SL)</option>
                                                <option value="PL">Privilege Leave (PL)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duration (Days)</label>
                                            <input type="number" min="1" value={days} onChange={e => setDays(Number(e.target.value))} className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-6 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-600/20" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason</label>
                                        <textarea placeholder="Specify reason..." value={reason} onChange={e => setReason(e.target.value)} rows={4} className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-6 text-slate-800 resize-none outline-none focus:ring-2 focus:ring-indigo-600/20" required></textarea>
                                    </div>
                                    <button type="submit" disabled={loading} className="w-full py-6 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-500 transition-all">Submit Request</button>
                                </form>
                            </div>

                            <div className="bg-slate-50 shadow-sm border border-slate-100 p-8 rounded-[32px]">
                                <h3 className="text-xl font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100 flex justify-between items-center">
                                    My Applications
                                    <span className="text-[10px] font-black bg-indigo-600/10 text-indigo-400 px-3 py-1 rounded-full uppercase">{myRequests.length}</span>
                                </h3>
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                                    {myRequests.length > 0 ? (
                                        myRequests.map(req => (
                                            <div key={req.id} className="p-5 rounded-2xl border border-slate-100 bg-white/50 flex justify-between items-center group hover:border-indigo-600/30 transition-all">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{req.leave_type} Leave ({req.days} Days)</p>
                                                    <p className="text-xs text-slate-400 italic mt-1">"{req.reason}"</p>
                                                    <p className="text-[9px] text-gray-600 mt-2 lowercase">{new Date(req.created_at).toLocaleDateString()}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${req.status === 'PENDING' ? 'text-orange-400 bg-orange-400/10' : req.status === 'APPROVED' ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>{req.status}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 opacity-30">
                                            <FaPaperPlane className="text-3xl mx-auto mb-3" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No recent applications</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttendancePage;


