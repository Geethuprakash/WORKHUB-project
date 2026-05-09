"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { FaShieldAlt, FaTerminal, FaKey, FaLock, FaUserShield } from "react-icons/fa";
import Link from "next/link";

const SuperAdminLoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuth();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const { data } = await api.post("/api/auth/login", {
                email,
                password,
                portal: 'super'
            });
            login(data);
        } catch (err: any) {
            if (err.code === "ERR_NETWORK" || !err.response) {
                setError("NETWORK ERROR: SERVER UNREACHABLE. KERNEL OFFLINE.");
            } else {
                setError(err.response?.data?.message || "Authentication failed. Unauthorized access detected.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden font-mono text-slate-800">
            {/* Cyber Matrix Background Effect */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-10 animate-scanline"></div>
                <div className="h-full w-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            </div>

            {/* Glowing Red Alerts (Subtle) */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] animate-pulse"></div>

            <div className="w-full max-w-lg z-20">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-24 h-24 mb-6 rounded-full bg-red-600/10 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                        <FaUserShield className="text-red-500 text-4xl animate-pulse" />
                    </div>
                    <h1 className="text-3xl font-black tracking-widest text-slate-800 uppercase mb-2">
                        System <span className="text-red-500">Kernel</span> Access
                    </h1>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.5em]">WorkHub SuperAdmin Protocol v4.0.2</p>
                </div>

                <div className="bg-black/40 backdrop-blur-xl border border-red-900/30 p-12 rounded-[20px] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>

                    {error && (
                        <div className="mb-8 p-4 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-[10px] font-bold uppercase tracking-widest text-center">
                            [ERROR]: {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-red-500/50 uppercase tracking-[0.3em] ml-1">Admin Identity</label>
                            <div className="relative group">
                                <FaTerminal className="absolute left-4 top-1/2 -translate-y-1/2 text-red-900 group-focus-within:text-red-500 transition-colors" />
                                <input
                                    type="email"
                                    placeholder="root@workhub.sys"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/60 border border-red-900/20 rounded py-4 pl-12 pr-4 text-red-500 placeholder:text-red-900/50 focus:outline-none focus:border-red-500/50 transition-all text-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-red-500/50 uppercase tracking-[0.3em] ml-1">Encrypted Payload</label>
                            <div className="relative group">
                                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-red-900 group-focus-within:text-red-500 transition-colors" />
                                <input
                                    type="password"
                                    placeholder="********"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/60 border border-red-900/20 rounded py-4 pl-12 pr-4 text-red-500 placeholder:text-red-900/50 focus:outline-none focus:border-red-500/50 transition-all text-sm"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-red-900/20 border border-red-500/50 hover:bg-red-600 hover:text-white text-red-500 font-black py-4 rounded transition-all disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs active:scale-95"
                        >
                            {loading ? "Decrypting..." : "Execute Access Protocol"}
                            <FaShieldAlt className={loading ? "animate-spin" : ""} />
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <Link href="/login" className="text-[9px] text-gray-600 hover:text-slate-500 transition-colors uppercase tracking-[0.3em]">
                            Return to Public Portal
                        </Link>
                    </div>
                </div>

                <div className="mt-8 flex justify-between items-center text-[8px] text-gray-700 font-bold uppercase tracking-widest px-2">
                    <span>Secure Node: ON</span>
                    <span>Level 5 Authorization required</span>
                    <span>AES-256 Active</span>
                </div>
            </div>

            <style jsx>{`
                @keyframes scanline {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100%); }
                }
                .animate-scanline {
                    animation: scanline 8s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default SuperAdminLoginPage;

