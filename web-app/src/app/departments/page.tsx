"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Cookies from "js-cookie";
import { FaBuilding, FaPlus, FaTimes, FaLayerGroup, FaDotCircle, FaTrash, FaShieldAlt } from "react-icons/fa";

interface Department {
    id: number;
    name: string;
    status: string;
}

const DepartmentsPage = () => {
    const { user } = useAuth();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const token = Cookies.get("token");
            const { data } = await api.get("/api/departments", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDepartments(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchDepartments();
    }, [user]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = Cookies.get("token");
            await api.post("/api/departments", {
                name
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setShowModal(false);
            setName("");
            fetchDepartments();
        } catch (error) {
            console.error(error);
            alert("Failed to create department");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to decommission this division? All association data for this node will be disconnected.")) return;
        try {
            const token = Cookies.get("token");
            await api.delete(`/api/departments/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchDepartments();
        } catch (error) {
            console.error(error);
            alert("Failed to decommission division");
        }
    };

    if (!user) return null;

    return (
        <div className="p-8 bg-white min-h-screen text-slate-800 font-sans">
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-800">
                        Mission <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Control</span>
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Manage organizational divisions and strategic departments.</p>
                </div>
                {user.role === 'ADMIN' && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-8 py-4 bg-blue-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                    >
                        <FaPlus />
                        Initialize Division
                    </button>
                )}
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Fetching Intel...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {departments.map((dept) => (
                        <div key={dept.id} className="bg-slate-50 shadow-sm border border-slate-100 p-8 rounded-[32px] hover:border-blue-600/30 transition-all group relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 text-blue-600/5 text-8xl transform rotate-12 group-hover:scale-110 transition-transform">
                                <FaBuilding />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6 relative z-10">
                                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm group-hover:scale-110 transition-transform">
                                        <FaBuilding className="text-blue-500 text-xl" />
                                    </div>
                                    {user.role === 'ADMIN' && (
                                        <button 
                                            onClick={() => handleDelete(dept.id)}
                                            className="p-3 text-red-900 hover:text-red-500 transition-colors border border-slate-100 rounded-2xl hover:bg-red-500/10"
                                            title="Decommission Division"
                                        >
                                            <FaTrash className="text-sm" />
                                        </button>
                                    )}
                                </div>
                                <h3 className="text-xl font-black text-slate-800 mb-2">{dept.name}</h3>
                                <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identifier</span>
                                    <span className="text-xs font-bold text-blue-400">DIV-{dept.id.toString().padStart(3, '0')}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {departments.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-100">
                            <FaBuilding className="text-4xl text-gray-700 mx-auto mb-4" />
                            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No Divisions Active</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-50 shadow-2xl border border-slate-100 rounded-[40px] p-10 w-full max-w-xl relative overflow-hidden text-slate-800">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-3xl font-black text-slate-800">New <span className="text-blue-600">Division</span></h2>
                                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Initialize Organizational Node</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-all border border-slate-200 shadow-sm">
                                <FaTimes className="text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Division Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Strategic Operations Units"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-6 text-slate-800 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all font-medium"
                                    required
                                />
                            </div>

                            <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 mt-4 active:scale-95">
                                Initialize Division
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DepartmentsPage;


