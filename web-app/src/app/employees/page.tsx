"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Cookies from "js-cookie";
import { FaUsers, FaPlus, FaTimes, FaEnvelope, FaIdCard, FaBuilding, FaUserTie, FaShieldAlt, FaTrash } from "react-icons/fa";

interface Employee {
    id: number;
    employee_code: string;
    display_name: string;
    email: string;
    designation: string;
    role?: string;
    department_name?: string;
}

interface Department {
    id: number;
    name: string;
}

const EmployeesPage = () => {
    const { user } = useAuth();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(true);

    // Form State
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [code, setCode] = useState("");
    const [deptId, setDeptId] = useState("");
    const [designation, setDesignation] = useState("");
    const [role, setRole] = useState("EMPLOYEE");

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = Cookies.get("token");
            const [empRes, deptRes] = await Promise.all([
                api.get("/api/employees", { headers: { Authorization: `Bearer ${token}` } }),
                api.get("/api/departments", { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setEmployees(empRes.data);
            setDepartments(deptRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = Cookies.get("token");
            await api.post("/api/employees", {
                display_name: name,
                email,
                password,
                employee_code: code,
                department_id: deptId,
                designation,
                role
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setShowModal(false);
            fetchData();
            setName(""); setEmail(""); setPassword(""); setCode(""); setDeptId(""); setDesignation(""); setRole("EMPLOYEE");
        } catch (error) {
            console.error(error);
            alert("Failed to create employee");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to terminate this member? This action is irreversible.")) return;
        try {
            const token = Cookies.get("token");
            await api.delete(`/api/employees/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchData();
        } catch (error) {
            console.error(error);
            alert("Failed to terminate member");
        }
    };

    if (!user || user.role === 'EMPLOYEE') return <div className="p-8 text-slate-800 bg-white min-h-screen font-black text-4xl uppercase">Access <span className="text-red-500">Denied</span>.</div>;

    return (
        <div className="p-8 bg-white min-h-screen text-slate-800 font-sans">
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-800">
                        Personnel <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Directory</span>
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium">Manage and oversee all organization members.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-8 py-4 bg-blue-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                >
                    <FaPlus />
                    Recruit Member
                </button>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing workforce...</p>
                </div>
            ) : (
                <div className="bg-slate-50 shadow-sm border border-slate-100 rounded-[32px] overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-white border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee Intel</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Role / Level</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Division</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Credentials</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800 bg-slate-50/50">
                            {employees
                                .filter(emp => user.role !== 'MANAGER' || emp.display_name !== user.name)
                                .map((emp) => (
                                <tr key={emp.id} className="hover:bg-slate-100/50 transition-colors group">
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center text-blue-400 font-bold border border-slate-200 group-hover:scale-110 transition-transform">
                                                {emp.display_name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800">{emp.display_name}</p>
                                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">{emp.employee_code}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${emp.role === 'SUPER_ADMIN' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                            emp.role === 'ADMIN' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                                                emp.role === 'MANAGER' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                                    'bg-gray-500/10 border-gray-500/20 text-slate-500'
                                            }`}>
                                            {emp.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <FaBuilding className="text-xs text-indigo-400/50" />
                                            <span className="text-xs font-bold">{emp.department_name || 'Unassigned'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <FaEnvelope className="text-[10px]" />
                                                <span className="text-xs font-medium lowercase tracking-tight">{emp.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => {
                                                    setSelectedEmployee(emp);
                                                    setShowProfile(true);
                                                }}
                                                className="text-[10px] font-black text-slate-400 hover:text-slate-800 transition-colors uppercase tracking-widest border border-slate-100 px-4 py-2 rounded-xl hover:bg-slate-100"
                                            >
                                                Profile
                                            </button>
                                            {user.role === 'ADMIN' && (
                                                <button 
                                                    onClick={() => handleDelete(emp.id)}
                                                    className="p-2.5 text-red-900 hover:text-red-500 transition-colors border border-slate-100 rounded-xl hover:bg-red-500/10"
                                                    title="Terminate Member"
                                                >
                                                    <FaTrash className="text-xs" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-50 shadow-2xl border border-slate-100 rounded-[40px] p-10 w-full max-w-4xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-3xl font-black text-slate-800">Recruit <span className="text-blue-600">Member</span></h2>
                                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Configure Authorization & Profile</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-all border border-slate-200 shadow-sm">
                                <FaTimes className="text-slate-500" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Full Name</label>
                                    <input type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-6 text-slate-800 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all font-medium" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Employee ID</label>
                                    <input type="text" placeholder="EMP-001" value={code} onChange={e => setCode(e.target.value)} className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-6 text-slate-800 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all font-medium" required />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Email Address</label>
                                <input type="email" placeholder="john@workhub.link" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-6 text-slate-800 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all font-medium" required />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Access Key</label>
                                    <input type="password" placeholder="********" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-6 text-slate-800 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all font-medium" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Designation</label>
                                    <input type="text" placeholder="Systems Engineer" value={designation} onChange={e => setDesignation(e.target.value)} className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-6 text-slate-800 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all font-medium" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Division</label>
                                    <select value={deptId} onChange={e => setDeptId(e.target.value)} className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-6 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all font-medium appearance-none" required>
                                        <option value="">Select Division</option>
                                        {departments.map(d => <option key={d.id} value={String(d.id)} className="bg-slate-50">{d.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Permission Level</label>
                                    <select value={role} onChange={e => setRole(e.target.value)} className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-6 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all font-medium appearance-none" required>
                                        <option value="EMPLOYEE">Level 1: Employee</option>
                                        <option value="MANAGER">Level 2: Manager</option>
                                        <option value="ADMIN">Level 3: Admin</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 mt-4 active:scale-95">
                                Finalize Recruitment
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Profile View Modal */}
            {showProfile && selectedEmployee && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-50 shadow-2xl border border-slate-100 rounded-[40px] p-10 w-full max-w-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-600 to-blue-600"></div>
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-indigo-600/20">
                                    {selectedEmployee.display_name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">{selectedEmployee.display_name}</h2>
                                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">{selectedEmployee.designation || 'System Operative'}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowProfile(false)} className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-all border border-slate-200">
                                <FaTimes className="text-slate-500" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mt-10">
                            <div className="bg-white border border-slate-100 p-6 rounded-3xl">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Identification</p>
                                <div className="flex items-center gap-4">
                                    <FaIdCard className="text-indigo-400" />
                                    <span className="text-sm font-bold text-slate-800">{selectedEmployee.employee_code}</span>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-100 p-6 rounded-3xl">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Authorization</p>
                                <div className="flex items-center gap-4">
                                    <FaShieldAlt className="text-purple-400" />
                                    <span className="text-sm font-bold text-slate-800">{selectedEmployee.role}</span>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-100 p-6 rounded-3xl">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Communication</p>
                                <div className="flex items-center gap-4">
                                    <FaEnvelope className="text-blue-400" />
                                    <span className="text-sm font-bold text-slate-800">{selectedEmployee.email}</span>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-100 p-6 rounded-3xl">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Division Attachment</p>
                                <div className="flex items-center gap-4">
                                    <FaBuilding className="text-indigo-400" />
                                    <span className="text-sm font-bold text-slate-800">{selectedEmployee.department_name || 'Unassigned'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-slate-100 flex justify-between items-center text-right">
                            <div className="text-left">
                                {user.role === 'ADMIN' && (
                                    <button 
                                        onClick={() => {
                                            handleDelete(selectedEmployee.id);
                                            setShowProfile(false);
                                        }}
                                        className="flex items-center gap-2 text-[10px] font-black text-red-900 hover:text-red-500 transition-colors uppercase tracking-widest"
                                    >
                                        <FaTrash />
                                        Terminate Member
                                    </button>
                                )}
                            </div>
                            <button onClick={() => setShowProfile(false)} className="px-8 py-4 bg-slate-100 text-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200">
                                Close Terminal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeesPage;


