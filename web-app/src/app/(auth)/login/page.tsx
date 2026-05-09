"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { FaLock, FaEnvelope, FaRocket, FaShieldAlt } from "react-icons/fa";
import Link from "next/link";

const LoginPage = () => {
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
            });
            login(data);
        } catch (err: any) {
            setError(err.response?.data?.message || "Invalid credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col relative overflow-hidden font-sans text-slate-800">
            {/* Dynamic Background Elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] animate-pulse pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px] animate-pulse pointer-events-none" style={{ animationDelay: '3s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>

            {/* Top Navigation Bar */}
            <nav className="relative w-full bg-white/50 backdrop-blur-md border-b border-slate-100/50 z-50 flex items-center justify-between px-8 py-4">
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-slate-800 tracking-tighter flex items-center gap-2">
                        <FaRocket className="text-blue-500" />
                        WorkHub
                    </span>
                </div>
                <div className="flex items-center gap-8 pr-4">
                    <Link href="/" className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">Home</Link>
                    <Link href="/services" className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">Services</Link>
                    <Link href="/about" className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">About</Link>
                    <Link href="/login" className="text-sm font-bold text-slate-800 transition-colors">Login</Link>
                    <Link href="/register" className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20">Get Started</Link>
                </div>
            </nav>

            <div className="flex-1 flex flex-col items-center p-6 relative z-10 w-full overflow-y-auto">
                <div className="w-full max-w-md py-8 my-auto">
                    {/* Branding Section */}
                    <div className="text-center mb-10 transform transition-all hover:scale-105 duration-500">
                        <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-[0_0_50px_rgba(37,99,235,0.2)] border border-slate-100 ring-4 ring-[#0a0a0a]">
                            <FaRocket className="text-slate-800 text-3xl animate-bounce-slow" />
                        </div>
                        <h1 className="text-5xl font-black text-slate-800 tracking-tighter mb-2">
                            Work<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Hub</span>
                        </h1>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Enterprise Intelligence Portal</p>
                    </div>

                    {/* Login Card */}
                    <div className="bg-slate-50 border border-slate-100 p-10 rounded-[40px] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-50"></div>

                        <div className="mb-8 text-center">
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome Back</h2>
                            <p className="text-slate-400 text-sm">Sign in to access your secure environment</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs text-center font-semibold animate-shake">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2 group/field">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within/field:text-blue-500 transition-colors">Access Identifier</label>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within/field:text-blue-500 transition-colors" />
                                    <input
                                        type="email"
                                        placeholder="email@organization.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-slate-800 placeholder:text-slate-500 focus:outline-none focus:border-blue-600/50 focus:ring-4 focus:ring-blue-600/10 transition-all font-medium"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 group/field">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-focus-within/field:text-blue-500 transition-colors">Security Key</label>
                                    <button type="button" className="text-[9px] font-bold text-blue-400/60 hover:text-blue-400 transition-colors uppercase tracking-widest">Forgot?</button>
                                </div>
                                <div className="relative">
                                    <FaLock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within/field:text-blue-500 transition-colors" />
                                    <input
                                        type="password"
                                        placeholder="********"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-slate-800 placeholder:text-slate-500 focus:outline-none focus:border-blue-600/50 focus:ring-4 focus:ring-blue-600/10 transition-all font-medium"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full relative group/btn overflow-hidden bg-blue-600 text-white font-black py-5 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                                <span className="relative z-10">
                                    {loading ? "Authenticating..." : "Authorize Access"}
                                </span>
                                {!loading && <FaShieldAlt className="relative z-10" />}
                            </button>
                        </form>

                        <div className="mt-10 pt-10 border-t border-slate-100 text-center">
                            <p className="text-slate-400 text-xs font-medium tracking-tight">
                                Need a new instance?{" "}
                                <Link href="/register" className="text-blue-500 font-bold hover:text-blue-400 transition-colors underline underline-offset-4 decoration-blue-500/30">
                                    Register Organization
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Footer Credits */}
                    <div className="mt-12 text-center opacity-30 flex items-center justify-center gap-6">
                        <div className="h-px w-10 bg-gray-500"></div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Deployment Node: Alpha-7</p>
                        <div className="h-px w-10 bg-gray-500"></div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(-5%); }
                    50% { transform: translateY(0); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s infinite ease-in-out;
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
                .animate-shake {
                    animation: shake 0.4s ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default LoginPage;



