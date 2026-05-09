"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { FaTrophy, FaChartBar, FaCheckCircle, FaTimesCircle, FaClock, FaDollarSign, FaIdCard } from "react-icons/fa";

interface Bonus {
    id: number;
    employee_id: number;
    employee_name: string;
    employee_code: string;
    manager_name: string;
    amount: number;
    reason: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    performance_score: number;
    created_at: string;
}

interface PerformanceData {
    employee_id: number;
    performance_score: number;
    total_tasks: number;
    completed_tasks: number;
    attendance_days: number;
}

interface Employee {
    id: number;
    display_name: string;
    employee_code: string;
    designation: string;
    performance_score: number;
    role: string;
}

export default function BonusSection() {
    const { user } = useAuth();
    const [bonuses, setBonuses] = useState<Bonus[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [perfData, setPerfData] = useState<PerformanceData | null>(null);
    const [bonusAmount, setBonusAmount] = useState<string>("");
    const [bonusReason, setBonusReason] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    const isEmployee = user?.role === 'EMPLOYEE';
    const isManager = user?.role === 'MANAGER';
    const isAdmin = user?.role === 'ADMIN';

    const fetchData = async () => {
        try {
            const { data: bonusList } = await api.get('/api/bonuses');
            setBonuses(bonusList);

            if (isManager || isAdmin) {
                const { data: empList } = await api.get('/api/employees');
                setEmployees(empList);
            }
        } catch (error) {
            console.error("Failed to fetch bonuses:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const analyzePerformance = async (empId: number) => {
        try {
            const { data } = await api.get(`/api/bonuses/performance/${empId}`);
            setPerfData(data);
            
            if (data.performance_score >= 90) setBonusAmount("5000");
            else if (data.performance_score >= 75) setBonusAmount("3000");
            else if (data.performance_score >= 60) setBonusAmount("1000");
            else setBonusAmount("0");
        } catch (error) {
            console.error("Performance analysis failed:", error);
        }
    };

    const requestBonusAction = async () => {
        if (!selectedEmployee || !bonusAmount || !bonusReason) {
            alert("Please select an employee, amount, and reason.");
            return;
        }
        try {
            await api.post('/api/bonuses/request', {
                employee_id: selectedEmployee.id,
                amount: parseFloat(bonusAmount),
                reason: bonusReason,
                performance_score: perfData?.performance_score || 0
            });
            alert("Bonus request submitted!");
            setBonusAmount("");
            setBonusReason("");
            setSelectedEmployee(null);
            setPerfData(null);
            fetchData();
        } catch (error) {
            console.error("Failed to submit bonus request:", error);
        }
    };

    const updateStatus = async (id: number, status: string) => {
        try {
            await api.put(`/api/bonuses/${id}/status`, { status });
            fetchData();
        } catch (error) {
            console.error(`Failed to ${status} bonus:`, error);
        }
    };

    const handleAutoGenerate = async () => {
        setIsGenerating(true);
        try {
            const { data } = await api.post('/api/bonuses/auto-generate');
            alert(data.message);
            fetchData();
        } catch (error) {
            console.error("Auto-generation failed:", error);
            alert("Analysis failed. Ensure performance data is synchronized.");
        } finally {
            setIsGenerating(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500 font-black uppercase tracking-widest text-xs">Accessing Economic Ledger...</div>;

    return (
        <div className="w-full text-slate-800 font-sans mt-6">
            {/* Header Section */}
            <div className="mb-12 flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter text-slate-800 uppercase">
                        Economic <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Rewards</span>
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2">Performance Incentive Intelligence Portal</p>
                </div>
                <div className="flex gap-4 items-center">
                    {isAdmin && (
                        <button 
                            onClick={handleAutoGenerate}
                            disabled={isGenerating}
                            className={`flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95 ${isGenerating ? 'opacity-50 animate-pulse' : ''}`}
                        >
                            <FaChartBar />
                            {isGenerating ? 'Calculating Metrics...' : 'System Audit & Propose'}
                        </button>
                    )}
                    <div className="bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-sm text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Rewarded</p>
                        <p className="text-xl font-black text-indigo-600">Rs.{bonuses.filter(b => b.status === 'APPROVED').reduce((sum, b) => sum + Number(b.amount), 0).toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Side Control Panel (Admin Only) */}
                {isAdmin && (
                    <div className="lg:col-span-1 space-y-6">
                        <div className="rounded-[40px] border border-slate-100 bg-white shadow-sm overflow-hidden relative group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 to-blue-600"></div>
                            <div className="pt-10 pb-4 px-6">
                                <h3 className="text-lg font-black uppercase tracking-widest text-slate-800 flex items-center justify-between gap-3 border-b border-slate-50 pb-4">
                                    <div className="flex items-center gap-3"><FaIdCard className="text-indigo-600" /> Performance Analysis</div>
                                    <div className="text-[8px] font-black bg-slate-100 px-2 py-1 rounded border border-slate-200 text-slate-400">LOGIC: (Tasks*0.6) + (Attendance*0.4)</div>
                                </h3>
                            </div>
                            <div className="space-y-6 pb-10 px-6">
                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Select Personnel</label>
                                    <select 
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all cursor-pointer"
                                        onChange={(e) => {
                                            const emp = employees.find(emp => emp.id === Number(e.target.value));
                                            if (emp) {
                                                setSelectedEmployee(emp);
                                                analyzePerformance(emp.id);
                                            }
                                        }}
                                        value={selectedEmployee?.id || ""}
                                    >
                                        <option value="">Choose Personnel...</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.display_name} - {emp.employee_code} ({emp.role})</option>
                                        ))}
                                    </select>
                                </div>

                                {perfData && selectedEmployee && (
                                    <div className="bg-indigo-600/5 rounded-3xl p-6 border border-indigo-600/10 space-y-4 animate-in fade-in zoom-in duration-300">
                                        <div className="flex justify-between items-center">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Yield Score</p>
                                            <div className="bg-indigo-600 text-white font-black px-4 py-1.5 rounded-full text-xs shadow-lg shadow-indigo-600/20">
                                                {perfData.performance_score}%
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white p-4 rounded-2xl border border-slate-50">
                                                <p className="text-[8px] font-black text-slate-400 uppercase">Task Yield (60%)</p>
                                                <p className="text-sm font-black text-slate-800">{perfData.completed_tasks}/{perfData.total_tasks}</p>
                                                <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
                                                    <div className="bg-blue-500 h-full" style={{ width: `${(perfData.completed_tasks / (perfData.total_tasks || 1)) * 100}%` }}></div>
                                                </div>
                                            </div>
                                            <div className="bg-white p-4 rounded-2xl border border-slate-50">
                                                <p className="text-[8px] font-black text-slate-400 uppercase">Attendance (40%)</p>
                                                <p className="text-sm font-black text-slate-800">{perfData.attendance_days}/20d</p>
                                                <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
                                                    <div className="bg-indigo-500 h-full" style={{ width: `${Math.min((perfData.attendance_days / 20) * 100, 100)}%` }}></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-2">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Incentive Payload (Rs.)</label>
                                                <input 
                                                    type="number"
                                                    value={bonusAmount}
                                                    onChange={(e) => setBonusAmount(e.target.value)}
                                                    placeholder="5000"
                                                    className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-6 text-sm font-black text-indigo-600 focus:outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Incentive Justification</label>
                                                <textarea 
                                                    value={bonusReason}
                                                    onChange={(e) => setBonusReason(e.target.value)}
                                                    placeholder="Extraordinary contribution to Alpha Project..."
                                                    className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-6 text-sm font-medium text-slate-800 h-24 focus:outline-none"
                                                />
                                            </div>
                                            <button 
                                                onClick={requestBonusAction}
                                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white border-none py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center"
                                            >
                                                Authorize Bonus
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Ledger View (Main Section) */}
                <div className={isAdmin ? "lg:col-span-2 space-y-6" : "lg:col-span-3 space-y-6"}>
                    <div className="rounded-[40px] border border-slate-100 bg-white shadow-sm overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-600 to-emerald-600"></div>
                        <div className="pt-10 pb-6 px-10 flex flex-row items-center justify-between border-b border-slate-50">
                            <h3 className="text-lg font-black uppercase tracking-widest text-slate-800 flex items-center gap-3">
                                <FaDollarSign className="text-green-500" /> Economic Ledger
                            </h3>
                        </div>
                        <div className="px-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50/50">
                                            <th className="px-10 py-6 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Personnel</th>
                                            <th className="px-10 py-6 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Score</th>
                                            <th className="px-10 py-6 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Amount</th>
                                            <th className="px-10 py-6 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Status</th>
                                            {isAdmin && <th className="px-10 py-6 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Override</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {bonuses.length === 0 ? (
                                            <tr>
                                                <td colSpan={isAdmin ? 5 : 4} className="px-10 py-20 text-center">
                                                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">No incentives logged in the current cycle.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            bonuses.map((bonus) => (
                                                <tr key={bonus.id} className="hover:bg-slate-50 transition-colors group">
                                                    <td className="px-10 py-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                                {bonus.employee_name[0]}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-slate-800">{bonus.employee_name}</p>
                                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{bonus.employee_code}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        <div className={`text-sm font-black ${bonus.performance_score >= 80 ? 'text-green-500' : bonus.performance_score >= 50 ? 'text-orange-500' : 'text-red-500'}`}>
                                                            {bonus.performance_score}%
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        <p className="text-sm font-black text-slate-800">Rs.{Number(bonus.amount).toLocaleString()}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 truncate max-w-[150px]">{bonus.reason}</p>
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                                            bonus.status === 'APPROVED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                            bonus.status === 'REJECTED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                            'bg-orange-500/10 text-orange-500 border-orange-500/20'
                                                        }`}>
                                                            {bonus.status === 'APPROVED' && <FaCheckCircle size={8} />}
                                                            {bonus.status === 'REJECTED' && <FaTimesCircle size={8} />}
                                                            {bonus.status === 'PENDING' && <FaClock size={8} />}
                                                            {bonus.status}
                                                        </span>
                                                    </td>
                                                    {isAdmin && (
                                                        <td className="px-10 py-6 text-right">
                                                            {bonus.status === 'PENDING' ? (
                                                                <div className="flex flex-col items-end gap-2">
                                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <button 
                                                                            onClick={() => updateStatus(bonus.id, 'APPROVED')}
                                                                            className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-all"
                                                                            title="Commit to Ledger"
                                                                        >
                                                                            <FaCheckCircle />
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => updateStatus(bonus.id, 'REJECTED')}
                                                                            className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                                                            title="Revoke Permission"
                                                                        >
                                                                            <FaTimesCircle />
                                                                        </button>
                                                                    </div>
                                                                    <p className="text-[7px] font-black text-slate-300 uppercase italic">From: {bonus.manager_name}</p>
                                                                </div>
                                                            ) : (
                                                                <p className="text-[8px] font-black text-slate-300 uppercase italic">Decision by {user.name} (Ref: {bonus.manager_name})</p>
                                                            )}
                                                        </td>
                                                    )}
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
