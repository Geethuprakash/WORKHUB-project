"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import EnquiryModal from "@/components/EnquiryModal";
import { FaPlus, FaCheckCircle, FaInbox, FaEnvelope, FaClock } from "react-icons/fa";

interface Enquiry {
    id: number;
    parent_id?: number | null; // Added for replies
    subject: string;
    message: string;
    sender_id: number;
    sender_role: string;
    sender_name?: string;
    sender_email?: string;
    receiver_id?: number;
    receiver_role?: string;
    receiver_name?: string;
    receiver_email?: string;
    status: "UNREAD" | "READ" | "RESOLVED";
    created_at: string;
}

const EnquiriesPage = () => {
    const { user } = useAuth();
    const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [replyToEnquiry, setReplyToEnquiry] = useState<Enquiry | null>(null);
    const [activeTab, setActiveTab] = useState<"received" | "sent">("received"); // Added for separating views // State for modal props

    const fetchEnquiries = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/api/enquiries");
            setEnquiries(data);
        } catch (error) {
            console.error("Error fetching enquiries:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchEnquiries();
        }
    }, [user]);

    const handleUpdateStatus = async (id: number, newStatus: "READ" | "RESOLVED") => {
        setUpdatingId(id);
        try {
            await api.put(`/api/enquiries/${id}/status`, { status: newStatus });
            setEnquiries(enquiries.map(e => e.id === id ? { ...e, status: newStatus } : e));
        } catch (error) {
            console.error("Error updating status:", error);
        } finally {
            setUpdatingId(null);
        }
    };

    if (!user) return null;

    const threads = enquiries.filter(e => !e.parent_id);
    const getReplies = (parentId: number) => enquiries.filter(e => e.parent_id === parentId).reverse();

    const receivedThreads = threads.filter(e => e.sender_id != (user as any)?._id);
    const sentThreads = threads.filter(e => e.sender_id == (user as any)?._id);
    const displayedThreads = activeTab === "received" ? receivedThreads : sentThreads;

    return (
        <div className="p-8 bg-white min-h-screen text-slate-800 font-sans">
            <header className="mb-12 flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <FaEnvelope className="text-white text-xl" />
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-800">
                            Enquiries
                        </h1>
                    </div>
                    <p className="text-slate-500 font-medium ml-16">
                        {user.role === "ADMIN" 
                            ? "Manage all communication and requests" 
                            : user.role === "MANAGER" 
                                ? "View employee enquiries and track your activity" 
                                : "Send and track your enquiries"}
                    </p>
                </div>

                {user.role !== "ADMIN" && (
                    <button
                        onClick={() => {
                            setReplyToEnquiry(null);
                            setIsModalOpen(true);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 hover:shadow-xl hover:shadow-indigo-500/30 active:scale-95 transition-all"
                    >
                        <FaPlus /> New Enquiry
                    </button>
                )}
            </header>

            <div className="bg-slate-50 shadow-sm border border-slate-100 p-8 rounded-[38px] relative overflow-hidden">
                {!loading && (
                    <div className="flex gap-3 mb-8">
                        <button
                            onClick={() => setActiveTab("received")}
                            className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === "received" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-600/20" : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200/50"}`}
                        >
                            Received <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === "received" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"}`}>{receivedThreads.length}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("sent")}
                            className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === "sent" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-600/20" : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200/50"}`}
                        >
                            Sent <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === "sent" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"}`}>{sentThreads.length}</span>
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-8 h-8 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading correspondence...</p>
                    </div>
                ) : displayedThreads.length === 0 ? (
                    <div className="text-center py-24 bg-white/50 rounded-[32px] border border-dashed border-slate-100">
                        <FaInbox className="text-indigo-600/20 text-5xl mx-auto mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No {activeTab} enquiries found.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {displayedThreads.map((enquiry) => (
                            <div 
                                key={enquiry.id} 
                                className={`p-6 rounded-[32px] border transition-all duration-300 bg-white/50 border-slate-100 hover:border-indigo-600/30 hover:bg-slate-100/10`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-5 flex-1">
                                        <div className="mt-1">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${enquiry.status === "RESOLVED" ? "bg-green-500/10 border-green-500/20" : "bg-blue-500/10 border-blue-500/20"}`}>
                                                {enquiry.status === "RESOLVED" ? <FaCheckCircle className="text-green-500" /> : <FaEnvelope className="text-blue-500" />}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-black text-lg tracking-tight text-slate-800">{enquiry.subject}</h3>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${enquiry.status === "RESOLVED" ? "bg-green-500/10 text-green-600 border border-green-500/20" : enquiry.status === "READ" ? "bg-blue-500/10 text-blue-600 border border-blue-500/20" : "bg-orange-500/10 text-orange-600 border border-orange-500/20"}`}>
                                                    {enquiry.status}
                                                </span>
                                            </div>
                                            <p className="text-slate-600 mt-2 text-sm">{enquiry.message}</p>
                                            
                                            <div className="flex items-center gap-4 mt-4 text-xs text-slate-400 font-medium">
                                                <div className="flex items-center gap-1">
                                                    <span className="font-bold text-slate-500">From:</span> {enquiry.sender_name || `User #${enquiry.sender_id}`} ({enquiry.sender_role})
                                                </div>
                                                {enquiry.receiver_role && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-bold text-slate-500">To:</span> {enquiry.receiver_role}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1">
                                                    <FaClock className="text-slate-300" /> {new Date(enquiry.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 ml-4">
                                        {user.role !== "EMPLOYEE" && enquiry.sender_id != (user as any)?._id && (
                                            <button
                                                onClick={() => {
                                                    setReplyToEnquiry(enquiry);
                                                    setIsModalOpen(true);
                                                }}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm shadow-blue-500/10 hover:shadow-md active:scale-95 transition-all flex items-center gap-1"
                                            >
                                                Reply
                                            </button>
                                        )}
                                        
                                        {(user.role === "ADMIN" || (user.role === "MANAGER" && enquiry.sender_role === "EMPLOYEE")) && (
                                            <>
                                                {enquiry.status === "UNREAD" && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(enquiry.id, "READ")}
                                                        disabled={updatingId === enquiry.id}
                                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors disabled:opacity-50"
                                                    >
                                                        Mark Read
                                                    </button>
                                                )}
                                                {enquiry.status !== "RESOLVED" && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(enquiry.id, "RESOLVED")}
                                                        disabled={updatingId === enquiry.id}
                                                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-xs shadow-sm hover:shadow transition-colors disabled:opacity-50"
                                                    >
                                                        Resolve
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Render Replies */}
                                {getReplies(enquiry.id).length > 0 && (
                                    <div className="mt-4 ml-12 pl-6 border-l-2 border-slate-200 space-y-3">
                                        {getReplies(enquiry.id).map((reply) => (
                                            <div key={reply.id} className="p-4 bg-slate-50/80 border border-slate-100 rounded-2xl relative">
                                                <p className="text-slate-700 text-sm">{reply.message}</p>
                                                <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-medium">
                                                    <span className="font-bold text-slate-500">{reply.sender_name || `User #${reply.sender_id}`} ({reply.sender_role})</span>
                                                    <span>•</span>
                                                    <span>{new Date(reply.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <EnquiryModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={fetchEnquiries}
                replyTo={replyToEnquiry}
            />
        </div>
    );
};

export default EnquiriesPage;
