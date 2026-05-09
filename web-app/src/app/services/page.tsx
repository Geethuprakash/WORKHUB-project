import Link from 'next/link';
import { FaRocket, FaBuilding, FaTasks, FaShieldAlt } from 'react-icons/fa';

export default function ServicesPage() {
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
                    <Link href="/services" className="text-sm font-bold text-blue-500 border-b-2 border-blue-500 pb-1">Services</Link>
                    <Link href="/about" className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">About</Link>
                    <Link href="/login" className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">Login</Link>
                    <Link href="/" className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20">Get Started</Link>
                </div>
            </nav>

            <main className="flex-1 flex flex-col items-center justify-center p-8 relative z-10 w-full max-w-7xl mx-auto">
                <div className="text-center mb-16 mt-8">
                    <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Services</span></h1>
                    <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">
                        WorkHub provides comprehensive enterprise management solutions designed to streamline logic and enforce secure data isolation.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 w-full px-4">
                    {/* Service Card 1 */}
                    <div className="bg-slate-50 shadow-sm border border-slate-100 rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300 relative group overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-16 h-16 rounded-2xl bg-blue-600/10 flex items-center justify-center mb-6">
                            <FaBuilding className="text-3xl text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-4">Multi-Tenant Architecture</h3>
                        <p className="text-slate-400 leading-relaxed text-sm">
                            Securely isolate data streams for every organization. Ensure complete privacy and unparalleled performance within a shared macro-infrastructure.
                        </p>
                    </div>

                    {/* Service Card 2 */}
                    <div className="bg-slate-50 shadow-sm border border-slate-100 rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300 relative group overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 flex items-center justify-center mb-6">
                            <FaShieldAlt className="text-3xl text-indigo-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-4">Role-Based Security</h3>
                        <p className="text-slate-400 leading-relaxed text-sm">
                            Granular permission sets for Administrators, Managers, and Employees. Maintain strict data-access pipelines through secure JWT authentication.
                        </p>
                    </div>

                    {/* Service Card 3 */}
                    <div className="bg-slate-50 shadow-sm border border-slate-100 rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300 relative group overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-16 h-16 rounded-2xl bg-purple-600/10 flex items-center justify-center mb-6">
                            <FaTasks className="text-3xl text-purple-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-4">Task & Finance Sync</h3>
                        <p className="text-slate-400 leading-relaxed text-sm">
                            Monitor objective milestones while automatically scaling complete enterprise payroll processing algorithms effortlessly.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}


