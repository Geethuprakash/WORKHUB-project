"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Cookies from "js-cookie";
import { FaUser, FaEnvelope, FaPhone, FaBriefcase, FaBuilding, FaIdBadge, FaCalendarAlt, FaShieldAlt, FaEdit, FaSave, FaTimes } from "react-icons/fa";

interface ProfileData {
    id: number;
    display_name: string;
    email: string;
    role: string;
    employee_code?: string;
    designation?: string;
    department_name?: string;
    phone?: string;
    joining_date?: string;
    status: string;
    tenant_code: string;
}

const ProfilePage = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ display_name: "", phone: "" });
    const [updating, setUpdating] = useState(false);

    const fetchProfile = async () => {
        try {
            const token = Cookies.get("token");
            const { data } = await api.get("/api/employees/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProfile(data);
            setEditData({ display_name: data.display_name, phone: data.phone || "" });
        } catch (err: any) {
            console.error("Error fetching profile:", err);
            setError(err.response?.data?.message || "Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user]);

    const handleUpdate = async () => {
        setUpdating(true);
        try {
            const token = Cookies.get("token");
            await api.put("/api/employees/profile", editData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            await fetchProfile();
            setIsEditing(false);
            alert("Profile updated successfully!");
        } catch (err: any) {
            console.error("Update error:", err);
            alert(err.response?.data?.message || "Failed to update profile");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-red-600/10 rounded-full flex items-center justify-center mb-6 border border-red-600/20">
                    <FaShieldAlt className="text-red-500 text-3xl" />
                </div>
                <h1 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight">Access Restricted</h1>
                <p className="text-slate-400 max-w-md font-medium">{error}</p>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="p-8 bg-white min-h-screen text-slate-800 font-sans">
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                            <FaUser className="text-white" />
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-800">
                            User <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Profile</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 font-medium ml-16 uppercase tracking-widest text-[10px]">Secure Identity & Management</p>
                </div>
                
                <div className="flex items-center gap-3">
                    {!isEditing ? (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/50 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
                        >
                            <FaEdit /> Edit Profile
                        </button>
                    ) : (
                        <>
                            <button 
                                onClick={() => setIsEditing(false)}
                                className="flex items-center gap-2 px-6 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95"
                            >
                                <FaTimes /> Cancel
                            </button>
                            <button 
                                onClick={handleUpdate}
                                disabled={updating}
                                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-green-600/20 disabled:opacity-50"
                            >
                                <FaSave /> {updating ? "Saving..." : "Save Changes"}
                            </button>
                        </>
                    )}
                    <button 
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95"
                    >
                        <span className="text-indigo-500">&lt;-</span> Back
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Overview Card */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-slate-50 shadow-sm border border-slate-100 p-8 rounded-[38px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 text-indigo-600/5 text-9xl transform translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-500">
                            <FaIdBadge />
                        </div>
                        
                        <div className="flex flex-col items-center text-center relative z-10 py-4">
                            <div className="w-32 h-32 bg-white rounded-full border-4 border-slate-100 flex items-center justify-center mb-6 relative group/avatar">
                                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 rounded-full animate-pulse"></div>
                                <FaUser className="text-gray-700 text-5xl group-hover/avatar:text-indigo-500 transition-colors duration-300" />
                            </div>
                            
                            {isEditing ? (
                                <div className="w-full px-4 mb-4">
                                    <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 block text-left">Full Name</label>
                                    <input 
                                        type="text"
                                        value={editData.display_name}
                                        onChange={(e) => setEditData({...editData, display_name: e.target.value})}
                                        className="w-full bg-white border border-slate-100 rounded-xl py-2 px-4 text-slate-800 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-center"
                                    />
                                </div>
                            ) : (
                                <h2 className="text-3xl font-black text-slate-800 tracking-tight">{profile.display_name}</h2>
                            )}
                            
                            <p className="text-indigo-400 font-black uppercase tracking-[0.2em] text-[10px] mt-2 mb-6 px-4 py-1.5 bg-indigo-600/10 rounded-full border border-indigo-600/20">
                                {profile.role}
                            </p>
                            
                            <div className="w-full flex items-center justify-center gap-3">
                                <span className={`w-2 h-2 rounded-full ${profile.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Status: {profile.status}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 p-8 rounded-[38px] relative group overflow-hidden">
                         <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                                <FaShieldAlt className="text-blue-500" />
                            </div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest text-slate-400">Security <span className="text-slate-800">Profile</span></h3>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-white/50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Tenant Authority</p>
                                <p className="text-slate-800 font-bold">{profile.tenant_code}</p>
                            </div>
                            <div className="bg-white/50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-[10px] text-slate-400 font-black uppercase mb-1">System ID</p>
                                <p className="text-slate-800 font-mono text-sm">#{String(profile.id).padStart(6, '0')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Personal Information */}
                    <div className="bg-slate-50 shadow-sm border border-slate-100 p-8 rounded-[38px] group">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-10 h-10 bg-emerald-600/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                                <FaEnvelope className="text-emerald-500" />
                            </div>
                            <h2 className="text-xl font-black text-slate-800">Contact <span className="text-slate-400 font-medium">Details</span></h2>
                        </div>
                        
                        <div className="space-y-10">
                            <div className="relative pl-10">
                                <FaEnvelope className="absolute left-0 top-1 text-gray-600 group-hover:text-emerald-500 transition-colors" />
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Email Address</p>
                                <p className="text-slate-800 font-bold text-lg">{profile.email}</p>
                            </div>
                            
                            <div className="relative pl-10">
                                <FaPhone className="absolute left-0 top-1 text-gray-600 group-hover:text-emerald-500 transition-colors" />
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Phone Number</p>
                                {isEditing ? (
                                    <input 
                                        type="text"
                                        value={editData.phone}
                                        onChange={(e) => setEditData({...editData, phone: e.target.value})}
                                        className="w-full bg-white border border-slate-100 rounded-xl py-2 px-4 text-slate-800 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                        placeholder="Enter phone number"
                                    />
                                ) : (
                                    <p className="text-slate-800 font-bold text-lg">{profile.phone || "Not Provided"}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Employment Information */}
                    <div className="bg-slate-50 shadow-sm border border-slate-100 p-8 rounded-[38px] group">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                                <FaBriefcase className="text-indigo-500" />
                            </div>
                            <h2 className="text-xl font-black text-slate-800">Work <span className="text-slate-400 font-medium">Identity</span></h2>
                        </div>
                        
                        <div className="space-y-10">
                            <div className="relative pl-10">
                                <FaIdBadge className="absolute left-0 top-1 text-gray-600 group-hover:text-indigo-500 transition-colors" />
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Employee Code</p>
                                <p className="text-slate-800 font-bold text-lg">{profile.employee_code || "N/A"}</p>
                            </div>
                            
                            <div className="relative pl-10">
                                <FaBriefcase className="absolute left-0 top-1 text-gray-600 group-hover:text-indigo-500 transition-colors" />
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Designation</p>
                                <p className="text-slate-800 font-bold text-lg">{profile.designation || "N/A"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Organization Information */}
                    <div className="bg-slate-50 shadow-sm border border-slate-100 p-8 rounded-[38px] md:col-span-2 group">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-10 h-10 bg-orange-600/10 rounded-xl flex items-center justify-center border border-orange-500/20">
                                <FaBuilding className="text-orange-500" />
                            </div>
                            <h2 className="text-xl font-black text-slate-800">Organization <span className="text-slate-400 font-medium">Data</span></h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="relative pl-12">
                                <div className="absolute left-0 top-0 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 group-hover:bg-orange-600/20 transition-colors">
                                    <FaBuilding className="text-slate-400 group-hover:text-orange-500 transition-colors" />
                                </div>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Department</p>
                                <p className="text-slate-800 font-bold text-lg">{profile.department_name || "N/A"}</p>
                            </div>
                            
                            <div className="relative pl-12">
                                <div className="absolute left-0 top-0 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 group-hover:bg-orange-600/20 transition-colors">
                                    <FaCalendarAlt className="text-slate-400 group-hover:text-orange-500 transition-colors" />
                                </div>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Joining Date</p>
                                <p className="text-slate-800 font-bold text-lg">
                                    {profile.joining_date ? new Date(profile.joining_date).toLocaleDateString('en-GB', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric'
                                    }) : "N/A"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
