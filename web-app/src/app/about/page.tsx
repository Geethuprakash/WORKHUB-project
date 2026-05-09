import Link from 'next/link';
import { FaRocket } from 'react-icons/fa';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white flex flex-col font-sans relative overflow-hidden text-slate-800">
            {/* Animated Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

            {/* Top Navigation Bar */}
            <nav className="relative w-full bg-white/90 backdrop-blur-md shadow-sm z-50 flex items-center justify-between px-8 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-slate-800 tracking-tighter flex items-center gap-2">
                        <FaRocket className="text-blue-500" />
                        WorkHub
                    </span>
                </div>
                <div className="flex items-center gap-8 pr-4">
                    <Link href="/" className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">Home</Link>
                    <Link href="/services" className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">Services</Link>
                    <Link href="/about" className="text-sm font-bold text-blue-500 border-b-2 border-blue-500 pb-1">About</Link>
                    <Link href="/login" className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">Login</Link>
                    <Link href="/" className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20">Get Started</Link>
                </div>
            </nav>

            <main className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10">
                <div className="bg-slate-50 shadow-2xl border border-slate-100 p-12 rounded-[40px] max-w-4xl w-full relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-50"></div>

                    <h1 className="text-5xl md:text-6xl font-black text-white mb-8 tracking-tight">About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">WorkHub</span></h1>

                    <div className="space-y-6 text-slate-500 text-lg md:text-xl font-medium leading-relaxed">
                        <p>
                            We are building the next generation of Enterprise Productivity tools.
                            At WorkHub, our mission is to help modern organizations streamline their complex workflows with secure, isolated, and blazing-fast software solutions.
                        </p>
                        <p>
                            Designed from the ground up with a robust Multi-Tenant Architecture and Role-Based Access controls, WorkHub ensures that every organization, whether small or large, has a secure environment to manage their tasks, employees, and finances effortlessly.
                        </p>
                    </div>

                    <div className="mt-12 pt-10 border-t border-slate-100">
                        <Link href="/" className="inline-flex items-center justify-center px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-colors uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                            Join the Network
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}


