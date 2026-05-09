"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Cookies from "js-cookie";
import { FaCheck, FaTimes, FaBuilding, FaClock, FaCheckCircle, FaTimesCircle, FaTrash } from "react-icons/fa";

interface Tenant {
    id: number;
    tenant_code: string;
    organization_name: string;
    project_area?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    criterias?: string;
    license_number?: string;
    gst_number?: string;
    created_at: string;
    plan_type?: string;
    payment_status?: string;
    amount_paid?: number;
}

const TenantsPage = () => {
    const { user } = useAuth();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [orgName, setOrgName] = useState("");
    const [projectArea, setProjectArea] = useState("");
    const [code, setCode] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");

    const fetchTenants = async () => {
        try {
            setLoading(true);
            const token = Cookies.get("token");
            const { data } = await api.get("/api/tenants", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTenants(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchTenants();
    }, [user]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = Cookies.get("token");
            await api.post("/api/tenants", {
                organization_name: orgName,
                project_area: projectArea,
                tenant_code: code.toUpperCase(),
                email,
                password,
                display_name: name
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setShowModal(false);
            fetchTenants();
            setOrgName(""); setProjectArea(""); setCode(""); setEmail(""); setPassword(""); setName("");
        } catch (error) {
            console.error(error);
            alert("Failed to create tenant");
        }
    };

    const handleStatusUpdate = async (id: number, action: 'approve' | 'reject') => {
        try {
            const token = Cookies.get("token");
            await api.put(`/api/tenants/${id}/${action}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchTenants();
        } catch (error) {
            console.error(error);
            alert(`Failed to ${action} tenant`);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this organization? This action cannot be undone.")) return;
        try {
            const token = Cookies.get("token");
            await api.delete(`/api/tenants/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchTenants();
        } catch (error) {
            console.error(error);
            alert("Failed to delete tenant");
        }
    };

    if (!user || user.role !== 'SUPER_ADMIN') return <p className="p-6 text-slate-800 bg-white min-h-screen">Access Denied. Super Admin only.</p>;

    return (
        <div className="p-8 bg-white min-h-screen text-slate-800 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight mb-2">Company Management</h1>
                        <p className="text-slate-400 font-medium">Approve or manage organization instances.</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-6 py-3 bg-blue-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95">
                        Add Organization
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {tenants.map((tenant) => (
                            <div key={tenant.id} className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-slate-200 transition-all group">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-2xl group-hover:border-blue-500/50 transition-colors">
                                        <FaBuilding className="text-blue-500" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-xl font-bold text-slate-800">{tenant.organization_name}</h3>
                                            <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">
                                                {tenant.project_area || "General"}
                                            </span>
                                            <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">
                                                {tenant.tenant_code}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-slate-400 font-medium">
                                            <span className="flex items-center gap-1.5 line-clamp-1 max-w-xs" title={tenant.criterias}>
                                                {tenant.criterias || "No criteria provided"}
                                            </span>
                                            <span>+</span>
                                            <span className="flex items-center gap-1.5 whitespace-nowrap bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-lg border border-blue-500/20 text-[10px] font-black uppercase">
                                                L: {tenant.license_number || "N/A"}
                                            </span>
                                            <span className="flex items-center gap-1.5 whitespace-nowrap bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-lg border border-indigo-500/20 text-[10px] font-black uppercase">
                                                GST: {tenant.gst_number || "N/A"}
                                            </span>
                                            <span>+</span>
                                            <span className="flex items-center gap-1.5 whitespace-nowrap">
                                                <FaClock className="text-xs" />
                                                {new Date(tenant.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                                    {/* Plan Type */}
                                    {tenant.plan_type && (
                                        <div className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[10px] font-black uppercase tracking-wider">
                                            {tenant.plan_type}
                                        </div>
                                    )}

                                    {/* Payment Status */}
                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                        tenant.payment_status === 'PAID' ? 'bg-green-500/10 text-green-500 border-green-500/10' : 'bg-red-500/10 text-red-500 border-red-500/10'
                                    }`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${tenant.payment_status === 'PAID' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        {tenant.payment_status === 'PAID' ? 'Paid' : 'Unpaid'}
                                    </div>

                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                        tenant.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                        tenant.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                        'bg-red-500/10 text-red-400 border-red-500/20'
                                    }`}>
                                        {tenant.status === 'APPROVED' && <FaCheckCircle />}
                                        {tenant.status === 'PENDING' && <FaClock />}
                                        {tenant.status === 'REJECTED' && <FaTimesCircle />}
                                        {tenant.status}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {tenant.status === 'PENDING' && (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleStatusUpdate(tenant.id, 'approve')}
                                                    className="p-3 bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white rounded-xl transition-all border border-green-500/20"
                                                    title="Approve"
                                                >
                                                    <FaCheck />
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(tenant.id, 'reject')}
                                                    className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-500/20"
                                                    title="Reject"
                                                >
                                                    <FaTimes />
                                                </button>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => handleDelete(tenant.id)}
                                            className="p-3 bg-red-900/10 text-red-500 hover:bg-red-600 hover:text-white rounded-xl transition-all border border-red-900/20"
                                            title="Delete Organization"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {tenants.length === 0 && (
                            <div className="text-center py-20 bg-slate-50/50 border border-dashed border-slate-100 rounded-[40px]">
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No organizations found.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-slate-50 shadow-2xl border border-slate-100 rounded-[40px] p-10 w-full max-w-md animate-in fade-in zoom-in duration-300">
                            <h2 className="text-2xl font-black mb-6 text-slate-800 tracking-tight">Add New Organization</h2>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <input type="text" placeholder="Organization Name" value={orgName} onChange={e => setOrgName(e.target.value)} className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/50" required />
                                <input type="text" placeholder="Project Area (e.g. Dubai)" value={projectArea} onChange={e => setProjectArea(e.target.value)} className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/50" required />
                                <input type="text" placeholder="Tenant Code (Unique)" value={code} onChange={e => setCode(e.target.value)} className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/50 uppercase" required />
                                <input type="text" placeholder="Admin Name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/50" required />
                                <input type="email" placeholder="Admin Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/50" required />
                                <input type="password" placeholder="Admin Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/50" required />

                                <div className="flex justify-end gap-3 mt-10">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 text-slate-400 hover:text-slate-800 font-bold text-xs uppercase tracking-widest transition-colors">Cancel</button>
                                    <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all active:scale-95 shadow-lg shadow-blue-600/20">Create Instance</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TenantsPage;


