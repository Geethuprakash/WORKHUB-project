"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Cookies from "js-cookie";
import { FaMoneyBillWave, FaLaptop, FaPlus, FaCalendarDay, FaUserTag, FaMicrochip, FaCogs, FaCheckCircle, FaHistory, FaFileInvoiceDollar, FaDownload } from "react-icons/fa";
import BonusSection from "@/components/BonusSection";

interface Salary {
    id: number;
    basic_salary: number;
    effective_from: string;
    display_name: string;
}

interface Asset {
    id: number;
    asset_name: string;
    serial_no: string;
    status: string;
    assigned_to_name?: string;
}

interface Employee {
    id: number;
    display_name: string;
}

interface PayrollRecord {
    id: number;
    month: number;
    year: number;
    basic_salary: number;
    hra: number;
    pf: number;
    net_salary: number;
    status: string;
    display_name: string;
    payment_date: string;
}

interface AssetRequest {
    id: number;
    employee_name: string;
    employee_code: string;
    description: string;
    status: string;
    created_at: string;
}

const FinancesPage = () => {
    const { user } = useAuth();
    const [salaries, setSalaries] = useState<Salary[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [assetRequests, setAssetRequests] = useState<AssetRequest[]>([]);
    const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"core" | "bonuses">("core");

    useEffect(() => {
        const tab = new URLSearchParams(window.location.search).get("tab");
        if (tab === "bonuses") {
            setActiveTab("bonuses");
        }
    }, []);

    // Payroll Form
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [processing, setProcessing] = useState(false);

    // Asset Form
    const [assetName, setAssetName] = useState("");
    const [serial, setSerial] = useState("");
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [assigningAsset, setAssigningAsset] = useState<number | null>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<number | string>("");

    // Salary Form (Admin)
    const [salaryEmployee, setSalaryEmployee] = useState<number | string>("");
    const [basicSalary, setBasicSalary] = useState("");

    // Request Form (Employee)
    const [requestDescription, setRequestDescription] = useState("");

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = Cookies.get("token");
            const [salRes, assetRes, payRes] = await Promise.all([
                api.get("/api/finance/salary", { headers: { Authorization: `Bearer ${token}` } }),
                api.get("/api/finance/assets", { headers: { Authorization: `Bearer ${token}` } }),
                api.get("/api/finance/payroll", { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setSalaries(salRes.data);
            setAssets(assetRes.data);
            setPayrolls(payRes.data);

            if (user?.role !== 'EMPLOYEE') {
                const [empRes, reqRes] = await Promise.all([
                    api.get("/api/employees", { headers: { Authorization: `Bearer ${token}` } }),
                    api.get("/api/finance/assets/requests", { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setEmployees(empRes.data);
                setAssetRequests(reqRes.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const handleProcessPayroll = async () => {
        setProcessing(true);
        try {
            const token = Cookies.get("token");
            await api.post("/api/finance/payroll/process", { month, year }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert(`Payroll for ${month}/${year} processed successfully!`);
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to process payroll");
        } finally {
            setProcessing(false);
        }
    };

    const handleMarkPaid = async (id: number) => {
        try {
            const token = Cookies.get("token");
            await api.put(`/api/finance/payroll/pay/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchData();
        } catch (error) {
            alert("Failed to update status");
        }
    };

    const handleAddAsset = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Submitting asset:", { assetName, serial });
        try {
            const token = Cookies.get("token");
            await api.post("/api/finance/assets", {
                asset_name: assetName,
                serial_no: serial,
                status: 'READY'
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchData();
            setAssetName(""); setSerial("");
            alert("Asset successfully added to registry!");
        } catch (error: any) {
            console.error("Registry Error:", error);
            alert(error.response?.data?.message || "Failed to add asset. Ensure serial ID is unique.");
        }
    };

    const handleSetSalary = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!salaryEmployee || !basicSalary) return;
        try {
            const token = Cookies.get("token");
            await api.post("/api/finance/salary", {
                employee_id: salaryEmployee,
                basic_salary: basicSalary
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchData();
            setSalaryEmployee(""); setBasicSalary("");
            alert("Salary record updated successfully!");
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to update salary");
        }
    };

    const handleAssignAsset = async () => {
        if (!assigningAsset || !selectedEmployee) return;
        try {
            const token = Cookies.get("token");
            await api.put(`/api/finance/assets/assign/${assigningAsset}`, {
                employee_id: selectedEmployee
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchData();
            setAssigningAsset(null);
            setSelectedEmployee("");
            alert("Asset assigned successfully");
        } catch (error) {
            console.error(error);
            alert("Failed to assign asset");
        }
    };

    const handleRequestAsset = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = Cookies.get("token");
            await api.post("/api/finance/assets/request", {
                item_name: assetName,
                description: requestDescription
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAssetName(""); setRequestDescription("");
            alert("Hardware request submitted successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to submit request");
        }
    };

    if (!user) return null;

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const downloadPayslip = (p: PayrollRecord) => {
        import('jspdf').then(({ jsPDF }) => {
            const doc = new jsPDF();
            const pageW = doc.internal.pageSize.getWidth();

            // Header bar
            doc.setFillColor(79, 70, 229);
            doc.rect(0, 0, pageW, 32, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text('WORKHUB', 14, 14);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text('Payslip Document', 14, 22);
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageW - 14, 22, { align: 'right' });

            // Employee Info box
            doc.setFillColor(248, 250, 252);
            doc.roundedRect(14, 40, pageW - 28, 36, 4, 4, 'F');
            doc.setTextColor(30, 41, 59);
            doc.setFontSize(13);
            doc.setFont('helvetica', 'bold');
            doc.text(p.display_name, 22, 54);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 116, 139);
            doc.text(`Pay Period: ${months[p.month - 1]} ${p.year}`, 22, 64);
            doc.text(`Status: ${p.status}`, pageW - 22, 64, { align: 'right' });

            // Earnings
            doc.setFillColor(240, 253, 244);
            doc.roundedRect(14, 86, (pageW - 34) / 2, 70, 4, 4, 'F');
            doc.setTextColor(22, 163, 74);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('EARNINGS', 22, 100);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(30, 41, 59);
            doc.setFontSize(9);
            doc.text('Basic Salary', 22, 114);
            doc.text(`Rs. ${Number(p.basic_salary).toLocaleString()}`, (pageW / 2) - 4, 114, { align: 'right' });
            doc.text('House Rent Allowance (HRA)', 22, 126);
            doc.text(`Rs. ${Number(p.hra).toLocaleString()}`, (pageW / 2) - 4, 126, { align: 'right' });
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(22, 163, 74);
            doc.text('Total Earnings', 22, 144);
            doc.text(`Rs. ${(Number(p.basic_salary) + Number(p.hra)).toLocaleString()}`, (pageW / 2) - 4, 144, { align: 'right' });

            // Deductions
            doc.setFillColor(255, 241, 242);
            doc.roundedRect((pageW / 2) + 6, 86, (pageW - 34) / 2, 70, 4, 4, 'F');
            doc.setTextColor(220, 38, 38);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text('DEDUCTIONS', (pageW / 2) + 14, 100);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(30, 41, 59);
            doc.setFontSize(9);
            doc.text('Provident Fund (PF)', (pageW / 2) + 14, 114);
            doc.text(`Rs. ${Number(p.pf).toLocaleString()}`, pageW - 14, 114, { align: 'right' });
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(220, 38, 38);
            doc.text('Total Deductions', (pageW / 2) + 14, 144);
            doc.text(`Rs. ${Number(p.pf).toLocaleString()}`, pageW - 14, 144, { align: 'right' });

            // Net Salary banner
            doc.setFillColor(79, 70, 229);
            doc.roundedRect(14, 168, pageW - 28, 28, 4, 4, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('NET SALARY', 22, 184);
            doc.setFontSize(14);
            doc.text(`Rs. ${Number(p.net_salary).toLocaleString()}`, pageW - 22, 184, { align: 'right' });

            // Payment info
            if (p.payment_date) {
                doc.setTextColor(100, 116, 139);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.text(`Paid on: ${new Date(p.payment_date).toLocaleDateString()}`, 14, 208);
            }

            // Footer
            doc.setTextColor(148, 163, 184);
            doc.setFontSize(7);
            doc.text('This is a computer-generated payslip and does not require a physical signature.', pageW / 2, 280, { align: 'center' });
            doc.text('WorkHub Enterprise Management System', pageW / 2, 286, { align: 'center' });

            doc.save(`Payslip_${p.display_name.replace(/ /g, '_')}_${months[p.month - 1]}_${p.year}.pdf`);
        });
    };

    return (
        <div className="p-8 bg-white min-h-screen text-slate-800 font-sans">
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-800">
                        Capital <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500">& Assets</span>
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Manage payroll ecosystems and corporate hardware inventory.</p>
                </div>
                {user.role !== 'EMPLOYEE' && (
                    <div className="flex gap-4 bg-slate-50 shadow-sm p-4 rounded-3xl border border-slate-100 backdrop-blur-md">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Period</span>
                            <div className="flex gap-2">
                                <select value={month} onChange={e => setMonth(Number(e.target.value))} className="bg-white border border-slate-100 rounded-xl px-3 py-1 text-sm focus:outline-none focus:border-green-500 text-slate-800">
                                    {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                                </select>
                                <select value={year} onChange={e => setYear(Number(e.target.value))} className="bg-white border border-slate-100 rounded-xl px-3 py-1 text-sm focus:outline-none focus:border-green-500 text-slate-800">
                                    {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>
                        <button
                            onClick={handleProcessPayroll}
                            disabled={processing}
                            className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-2xl px-6 font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 group"
                        >
                            <FaCogs className={processing ? "animate-spin" : "group-hover:rotate-45 transition-transform"} />
                            {processing ? "Processing..." : "Run Payroll"}
                        </button>
                    </div>
                )}
            </header>

            <div className="flex bg-slate-100/80 p-1 rounded-2xl border border-slate-200/50 max-w-sm mb-8">
                <button
                    onClick={() => setActiveTab("core")}
                    className={`flex-1 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === "core" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                >
                    Core Finances
                </button>
                <button
                    onClick={() => setActiveTab("bonuses")}
                    className={`flex-1 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === "bonuses" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                >
                    Rewards
                </button>
            </div>

            {activeTab === "bonuses" ? (
                <BonusSection />
            ) : (
                <>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">

                        {/* Salary Section */}
                        <div className="bg-slate-50 shadow-sm backdrop-blur-xl border border-slate-100 p-10 rounded-[40px] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-10 text-slate-800/5 text-8xl transform rotate-12 group-hover:scale-110 transition-transform">
                                <FaMoneyBillWave />
                            </div>
                            <h2 className="text-2xl font-black mb-8 flex items-center gap-4 text-slate-800">
                                <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20">
                                    <FaMoneyBillWave className="text-green-600" />
                                </div>
                                Base <span className="text-slate-400 font-medium">Salaries</span>
                            </h2>

                            {/* Admin Form: Manage Salaries */}
                            {user.role === 'ADMIN' && (
                                <form onSubmit={handleSetSalary} className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 bg-white shadow-sm p-6 rounded-3xl border border-slate-100">
                                    <div className="md:col-span-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Select Employee</label>
                                        <select value={salaryEmployee} onChange={e => setSalaryEmployee(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm text-slate-800 focus:outline-none focus:border-green-500" required>
                                            <option value="">Choose...</option>
                                            {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.display_name}</option>)}
                                        </select>
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Basic Salary</label>
                                        <input type="number" placeholder="50000" value={basicSalary} onChange={e => setBasicSalary(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm text-slate-800 focus:outline-none focus:border-green-500" required />
                                    </div>
                                    <div className="md:col-span-1 flex items-end">
                                        <button type="submit" className="w-full h-[46px] bg-green-600 hover:bg-green-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-green-500/20">
                                            <FaPlus /> Set Salary
                                        </button>
                                    </div>
                                </form>
                            )}

                            {loading ? (
                                <div className="animate-pulse space-y-4">
                                    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 shadow-sm rounded-3xl"></div>)}
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                                    {salaries.map(s => (
                                        <div key={s.id} className="bg-white shadow-sm border border-slate-100 p-6 rounded-3xl flex items-center justify-between group/item hover:bg-slate-100/50 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 flex items-center justify-center border border-slate-100">
                                                    <FaUserTag className="text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800 uppercase tracking-tight">{s.display_name}</p>
                                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black tracking-widest mt-1">
                                                        <FaCalendarDay />
                                                        <span>{new Date(s.effective_from).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-green-500">{s.basic_salary}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fixed Monthly</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Assets Section */}
                        <div className="bg-slate-50 shadow-sm backdrop-blur-xl border border-slate-100 p-10 rounded-[40px] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-10 text-slate-800/5 text-8xl transform -rotate-12 group-hover:scale-110 transition-transform">
                                <FaLaptop />
                            </div>
                            <h2 className="text-2xl font-black mb-8 flex items-center gap-4 text-slate-800">
                                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                                    <FaLaptop className="text-blue-600" />
                                </div>
                                Hardware <span className="text-slate-400 font-medium">Inventory</span>
                            </h2>

                            {/* Admin Form: Add Asset */}
                            {user.role === 'ADMIN' && !assigningAsset && (
                                <form onSubmit={handleAddAsset} className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 bg-white shadow-sm p-6 rounded-3xl border border-slate-100">
                                    <div className="md:col-span-1">
                                        <label htmlFor="assetModel" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Model</label>
                                        <input id="assetModel" name="asset_name" type="text" placeholder="MacBook Pro" value={assetName} onChange={e => setAssetName(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm text-slate-800 focus:outline-none focus:border-blue-500 placeholder:text-slate-500" required />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label htmlFor="serialId" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Serial ID</label>
                                        <input id="serialId" name="serial_no" type="text" placeholder="C02X..." value={serial} onChange={e => setSerial(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm text-slate-800 focus:outline-none focus:border-blue-500 placeholder:text-slate-500" required />
                                    </div>
                                    <div className="md:col-span-1 flex items-end">
                                        <button type="submit" className="w-full h-[46px] bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
                                            <FaPlus /> Registry
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Employee Form: Request Asset */}
                            {user.role === 'EMPLOYEE' && (
                                <form onSubmit={handleRequestAsset} className="mb-8 grid grid-cols-1 gap-4 bg-white shadow-sm p-6 rounded-3xl border border-slate-100">
                                    <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest px-2 mb-2">Request New Hardware</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Item Needed</label>
                                            <input type="text" placeholder="Monitor, Keyboard, etc." value={assetName} onChange={e => setAssetName(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm text-slate-800 focus:outline-none focus:border-blue-500 placeholder:text-slate-500" required />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Reason/Description</label>
                                            <input type="text" placeholder="Explain your requirement..." value={requestDescription} onChange={e => setRequestDescription(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm text-slate-800 focus:outline-none focus:border-blue-500 placeholder:text-slate-500" required />
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full h-[46px] bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-500/20">
                                        Submit Request
                                    </button>
                                </form>
                            )}

                            {/* Assignment Modal UI */}
                            {assigningAsset && (
                                <div className="mb-8 bg-blue-500/10 border border-blue-500/20 p-6 rounded-3xl animate-in fade-in slide-in-from-top-4">
                                    <h3 className="text-sm font-black text-blue-400 uppercase tracking-widest mb-4">Assigning: {assets.find(a => a.id === assigningAsset)?.asset_name}</h3>
                                    <div className="flex gap-4">
                                        <select
                                            value={selectedEmployee}
                                            onChange={e => setSelectedEmployee(e.target.value)}
                                            className="flex-1 bg-white border border-slate-100 rounded-xl py-3 px-4 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="">Select Employee...</option>
                                            {employees.map(emp => (
                                                <option key={emp.id} value={emp.id}>{emp.display_name}</option>
                                            ))}
                                        </select>
                                        <button onClick={handleAssignAsset} className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-6 font-black text-[10px] uppercase tracking-widest shadow-md transition-all">
                                            Confirm
                                        </button>
                                        <button onClick={() => setAssigningAsset(null)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl px-6 font-black text-[10px] uppercase tracking-widest transition-all">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Inbound Requests for Managers/Admins */}
                            {user.role !== 'EMPLOYEE' && assetRequests.length > 0 && (
                                <div className="mb-10 bg-blue-600/5 border border-blue-500/10 p-6 rounded-[32px]">
                                    <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                                        Pending Inbound Requests
                                    </h3>
                                    <div className="space-y-3">
                                        {assetRequests.map(req => (
                                            <div key={req.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center group/req">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-800 group-hover/req:text-blue-400 transition-colors">{req.description}</p>
                                                    <p className="text-[9px] text-slate-400 font-black uppercase mt-1">Requested by: {req.employee_name}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{new Date(req.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                                {assets.map(a => (
                                    <div key={a.id} className="bg-white shadow-sm border border-slate-100 p-6 rounded-3xl flex items-center justify-between group/item hover:bg-slate-100/50 transition-all border-l-4 border-l-blue-500/30 text-slate-800">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-blue-500/5 flex items-center justify-center border border-slate-100">
                                                <FaMicrochip className="text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 uppercase tracking-tight">{a.asset_name}</p>
                                                <p className="text-[10px] text-slate-400 font-black tracking-widest mt-1">ID: {a.serial_no}</p>
                                                {a.assigned_to_name && (
                                                    <p className="text-[9px] text-blue-400 font-bold mt-1 uppercase flex items-center gap-1">
                                                        <FaUserTag /> {a.assigned_to_name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest border ${a.status === 'READY' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>{a.status}</span>
                                            {user.role === 'MANAGER' && a.status === 'READY' && (
                                                <button
                                                    onClick={() => setAssigningAsset(a.id)}
                                                    className="p-2 bg-slate-100 border border-slate-200 rounded-lg text-blue-400 hover:bg-blue-600 hover:text-white transition-all text-xs"
                                                >
                                                    Assign
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Payroll History Section */}
                    <div className="bg-slate-50 shadow-sm backdrop-blur-xl border border-slate-100 p-10 rounded-[40px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 text-slate-800/5 text-8xl transform rotate-6 group-hover:scale-105 transition-transform">
                            <FaFileInvoiceDollar />
                        </div>
                        <h2 className="text-2xl font-black mb-8 flex items-center gap-4 text-slate-800">
                            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                                <FaHistory className="text-indigo-600" />
                            </div>
                            Payroll <span className="text-slate-400 font-medium">Disbursements</span>
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-separate border-spacing-y-4">
                                <thead>
                                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-6">
                                        <th className="pb-4 pl-6">Beneficiary</th>
                                        <th className="pb-4">Period</th>
                                        <th className="pb-4">Components (HRA/PF)</th>
                                        <th className="pb-4">Net Payable</th>
                                        <th className="pb-4">Status</th>
                                        <th className="pb-4 text-right pr-6">Payslip</th>
                                        {user.role !== 'EMPLOYEE' && <th className="pb-4 text-right pr-6">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {payrolls
                                        .filter(p => user.role !== 'MANAGER' || p.display_name !== user.name)
                                        .map(p => (
                                            <tr key={p.id} className="bg-white shadow-sm group/row hover:bg-slate-100/50 transition-all">
                                                <td className="py-6 pl-6 rounded-l-3xl">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center border border-slate-100 font-bold text-xs text-indigo-400">
                                                            {p.display_name.charAt(0)}
                                                        </div>
                                                        <span className="font-bold text-sm tracking-tight text-slate-800">{p.display_name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-6">
                                                    <span className="text-xs font-bold text-slate-500">{months[p.month - 1]} {p.year}</span>
                                                </td>
                                                <td className="py-6">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[10px] font-bold text-green-400">HRA: +{Number(p.hra)}</span>
                                                        <span className="text-[10px] font-bold text-red-400">PF: -{Number(p.pf)}</span>
                                                    </div>
                                                </td>
                                                <td className="py-6">
                                                    <span className="text-lg font-black text-slate-800">{Number(p.net_salary)}</span>
                                                </td>
                                                <td className="py-6">
                                                    <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border ${p.status === 'PAID' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                                                        {p.status}
                                                    </span>
                                                    {p.status === 'PAID' && p.payment_date && (
                                                        <p className="text-[8px] text-slate-400 mt-1 font-bold">{new Date(p.payment_date).toLocaleDateString()}</p>
                                                    )}
                                                </td>
                                                <td className="py-6">
                                                    <button
                                                        onClick={() => downloadPayslip(p)}
                                                        title="Download Payslip PDF"
                                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
                                                    >
                                                        <FaDownload /> PDF
                                                    </button>
                                                </td>
                                                {user.role !== 'EMPLOYEE' && (
                                                    <td className="py-6 pr-6 text-right rounded-r-3xl">
                                                        {p.status === 'PENDING' && (user.role === 'ADMIN' || p.display_name !== user.name) ? (
                                                            <button
                                                                onClick={() => handleMarkPaid(p.id)}
                                                                className="px-4 py-2 bg-slate-50 shadow-sm border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all"
                                                            >
                                                                Process Payment
                                                            </button>
                                                        ) : (
                                                            <div className="flex justify-end">
                                                                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                                                                    <FaCheckCircle className="text-green-500" />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                            {!loading && payrolls.length === 0 && (
                                <div className="py-20 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">
                                    No payroll history discovered for this organization.
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default FinancesPage;


