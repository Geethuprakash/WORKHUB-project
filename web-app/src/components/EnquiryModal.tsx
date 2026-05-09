"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface EnquiryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    replyTo?: any; // Expanded to handle replyTo object
}

const EnquiryModal = ({ isOpen, onClose, onSuccess, replyTo }: EnquiryModalProps) => {
    const { user } = useAuth();
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [receiverRole, setReceiverRole] = useState<"ADMIN" | "MANAGER">("ADMIN");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (replyTo && isOpen) {
            setSubject(replyTo.subject.startsWith("Re: ") ? replyTo.subject : `Re: ${replyTo.subject}`);
            setReceiverRole(replyTo.sender_role as "ADMIN" | "MANAGER");
        } else if (isOpen) {
            setSubject("");
            setMessage("");
            setReceiverRole("ADMIN");
        }
    }, [replyTo, isOpen]);

    if (!isOpen || !user) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await api.post("/api/enquiries", {
                subject,
                message,
                receiver_role: receiverRole,
                receiver_id: replyTo ? replyTo.sender_id : undefined,
                parent_id: replyTo ? replyTo.id : undefined,
            });

            setSubject("");
            setMessage("");
            onClose();
            if (onSuccess) onSuccess();
        } catch (err: any) {
            console.error("Error sending enquiry:", err);
            setError(err.response?.data?.message || "Failed to send enquiry");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl border border-slate-100 animate-in fade-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">{replyTo ? "Reply to Enquiry" : "Send Enquiry"}</h2>
                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                        {error}
                    </div>
                )}

                {replyTo && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 mb-4">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Replying to</p>
                        <p className="text-sm font-bold text-slate-800">{replyTo.sender_name || `User #${replyTo.sender_id}`} <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded-full text-slate-600 ml-1">{replyTo.sender_role}</span></p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">"{replyTo.message}"</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!replyTo && user.role === "EMPLOYEE" && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Send To</label>
                            <select
                                value={receiverRole}
                                onChange={(e) => setReceiverRole(e.target.value as "ADMIN" | "MANAGER")}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                            >
                                <option value="ADMIN">Admin</option>
                                <option value="MANAGER">Manager</option>
                            </select>
                        </div>
                    )}

                    {!replyTo && user.role === "MANAGER" && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Send To</label>
                            <input
                                type="text"
                                value="Admin"
                                disabled
                                className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Subject</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Brief description"
                            required
                            disabled={!!replyTo}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-70 disabled:bg-slate-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Message</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Enter your enquiry details here..."
                            rows={4}
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/20 active:scale-98 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {loading ? "Sending..." : "Send"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EnquiryModal;
