"use client";

import { FaBuilding, FaEnvelope, FaLock, FaUser, FaCode, FaRocket, FaShieldAlt, FaTasks, FaPhoneAlt, FaGlobe, FaMapMarkerAlt } from "react-icons/fa";
import Link from "next/link";

export default function Home() {

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-x-hidden font-sans scroll-smooth text-slate-800">
      {/* Animated Background Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#2563EB]/10 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#2563EB]/5 rounded-full blur-[120px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>

      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md shadow-sm z-50 flex items-center justify-between px-8 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-slate-800 tracking-tighter flex items-center gap-2">
            <FaRocket className="text-[#2563EB]" />
            WorkHub
          </span>
        </div>
        <div className="flex items-center gap-8 pr-4">
          <a href="#top" className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">Home</a>
          <a href="#services" className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">Services</a>
          <a href="#about" className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">About</a>
          <a href="#pricing" className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">Pricing</a>
          <Link href="/login" className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">Login</Link>
          <Link href="/register" className="px-6 py-2.5 bg-[#2563EB] text-white text-sm font-bold rounded-xl hover:bg-[#2563EB]/90 transition-all shadow-xl shadow-[#2563EB]/20">Get Started</Link>
        </div>
      </nav>

      <main id="top" className="w-full flex-1 z-10 relative pt-[72px] scroll-mt-20">
        {/* Massive Hero Section */}
        <section className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 md:p-12 w-full max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 lg:gap-24 w-full items-center">

            {/* Left Strategic Copy */}
            <div className="flex flex-col justify-center text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#2563EB] text-xs font-bold uppercase tracking-widest mb-8 w-fit mx-auto md:mx-0">
                <FaRocket className="text-[#2563EB]" /> Enterprise Architecture
              </div>

              <h1 className="text-5xl lg:text-7xl font-black text-slate-800 leading-[1.1] mb-6 tracking-tighter">
                Employee <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#2563EB]/50">
                  Management System.
                </span>
              </h1>

              <p className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed mb-10 max-w-xl mx-auto md:mx-0">
                Streamline your workforce, manage tasks with precision, and optimize payroll using WorkHub's secure and isolated enterprise workspace.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center md:justify-start">
                <a href="#services" className="px-8 py-4 bg-slate-50 border border-slate-100 text-slate-800 font-bold rounded-2xl hover:bg-slate-100 transition-colors shadow-2xl text-sm uppercase tracking-widest">
                  Explore Platform
                </a>
                <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
                  <FaShieldAlt className="text-2xl text-[#2563EB]/50" />
                  <span className="text-left leading-tight">SOC-2 Compliant<br />Zero-Trust Ready</span>
                </div>
              </div>
            </div>

            {/* Right Illustration */}
            <div className="w-full max-w-2xl mx-auto relative lg:mr-0 z-20 flex justify-center items-center">
              {/* Ambient Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/20 to-[#2563EB]/5 rounded-[40px] blur-3xl transform scale-110 pointer-events-none"></div>

              <div className="relative group overflow-hidden rounded-[40px] shadow-2xl border border-slate-100/10 active:scale-[0.98] transition-all duration-500">
                <img 
                  src="/hero-illustration.png" 
                  alt="Employee Management System" 
                  className="w-full h-auto object-cover transform scale-100 group-hover:scale-105 transition-all duration-700"
                />
              </div>
            </div>

          </div>
        </section>

        {/* Services Section */}
        <div id="services" className="w-full max-w-7xl mx-auto py-24 px-4 relative z-10 scroll-mt-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-6 tracking-tight">Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#2563EB]/50">Services</span></h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">
              WorkHub provides comprehensive enterprise management solutions designed to streamline logic and enforce secure data isolation.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 w-full">
            <div className="bg-slate-50 border border-slate-100 shadow-xl backdrop-blur-md rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300 relative group overflow-hidden">
              <div className="w-16 h-16 rounded-2xl bg-[#2563EB]/10 flex items-center justify-center mb-6 border border-[#2563EB]/20">
                <FaBuilding className="text-3xl text-[#2563EB]" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Multi-Tenant Architecture</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Securely isolate data streams for every organization. Ensure complete privacy and unparalleled performance within a shared macro-infrastructure.</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 shadow-xl backdrop-blur-md rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300 relative group overflow-hidden">
              <div className="w-16 h-16 rounded-2xl bg-[#2563EB]/10 flex items-center justify-center mb-6 border border-[#2563EB]/20">
                <FaShieldAlt className="text-3xl text-[#2563EB]" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Role-Based Security</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Granular permission sets for Administrators, Managers, and Employees. Maintain strict data-access pipelines through secure JWT authentication.</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 shadow-xl backdrop-blur-md rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300 relative group overflow-hidden">
              <div className="w-16 h-16 rounded-2xl bg-[#2563EB]/10 flex items-center justify-center mb-6 border border-[#2563EB]/20">
                <FaTasks className="text-3xl text-[#2563EB]" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Task & Finance Sync</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Monitor objective milestones while automatically scaling complete enterprise payroll processing algorithms effortlessly.</p>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div id="about" className="w-full max-w-4xl mx-auto py-24 px-4 relative z-10 text-center scroll-mt-12">
          <div className="bg-slate-50 shadow-2xl backdrop-blur-xl border border-slate-100 p-12 rounded-[40px] relative overflow-hidden">
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-8 tracking-tight">About <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#2563EB]/50">WorkHub</span></h2>
            <div className="space-y-6 text-slate-500 text-lg font-medium leading-relaxed">
              <p>We are building the next generation of Enterprise Productivity tools. At WorkHub, our mission is to help modern organizations streamline their complex workflows with secure, isolated, and blazing-fast software solutions.</p>
              <p>Designed from the ground up with a robust Multi-Tenant Architecture and Role-Based Access controls, WorkHub ensures that every organization, whether small or large, has a secure environment to manage their tasks, employees, and finances effortlessly.</p>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div id="pricing" className="w-full max-w-7xl mx-auto py-24 px-4 relative z-10 scroll-mt-12 border-t border-slate-100">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-6 tracking-tight">Simple, Transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#2563EB]/50">Pricing</span></h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">
              No hidden fees. Choose a plan that fits your organization's operational scale.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 w-full">
            {/* Starter Plan */}
            <div className="bg-slate-50 border border-slate-100 rounded-[30px] p-8 hover:-translate-y-2 transition-all duration-300 shadow-xl flex flex-col">
              <div className="mb-6">
                <span className="text-xs font-black text-[#2563EB] uppercase tracking-widest bg-[#2563EB]/10 px-3 py-1 rounded-full">Starter</span>
                <h3 className="text-3xl font-black text-slate-800 mt-4">Rs.999<span className="text-sm font-medium text-slate-400">/mo</span></h3>
                <p className="text-slate-500 text-xs mt-2">Perfect for startups and small teams</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-2 text-slate-600 text-sm"><FaShieldAlt className="text-[#2563EB]" /> Up to 10 Employees</li>
                <li className="flex items-center gap-2 text-slate-600 text-sm"><FaShieldAlt className="text-[#2563EB]" /> Basic Task Management</li>
                <li className="flex items-center gap-2 text-slate-600 text-sm"><FaShieldAlt className="text-[#2563EB]" /> Secure Multi-Tenant Data</li>
                <li className="flex items-center gap-2 text-slate-600 text-sm"><FaShieldAlt className="text-[#2563EB]" /> JWT Auth Subsystem</li>
              </ul>
              <Link href="/register?plan=BASIC&price=999" className="w-full py-4 text-center bg-slate-200 text-slate-800 font-bold rounded-2xl hover:bg-slate-300 transition-colors text-sm uppercase tracking-wider">
                Get Started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-slate-900 border border-slate-800 rounded-[30px] p-8 hover:-translate-y-2 transition-all duration-300 shadow-2xl flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#2563EB]"></div>
              <div className="mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-white uppercase tracking-widest bg-[#2563EB] px-3 py-1 rounded-full">Most Popular</span>
                </div>
                <h3 className="text-3xl font-black text-white mt-4">Rs.2,999<span className="text-sm font-medium text-slate-500">/mo</span></h3>
                <p className="text-slate-400 text-xs mt-2">Standard features for growing companies</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-2 text-slate-300 text-sm"><FaRocket className="text-[#2563EB]" /> Up to 100 Employees</li>
                <li className="flex items-center gap-2 text-slate-300 text-sm"><FaRocket className="text-[#2563EB]" /> Advanced Task Sync boards</li>
                <li className="flex items-center gap-2 text-slate-300 text-sm"><FaRocket className="text-[#2563EB]" /> Finance & Payroll Calculators</li>
                <li className="flex items-center gap-2 text-slate-300 text-sm"><FaRocket className="text-[#2563EB]" /> Detailed Audit Logs & Backups</li>
              </ul>
              <Link href="/register?plan=PRO&price=2999" className="w-full py-4 text-center bg-[#2563EB] text-white font-bold rounded-2xl hover:bg-[#2563EB]/90 transition-all text-sm uppercase tracking-wider shadow-lg shadow-[#2563EB]/20">
                Upgrade to Pro
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-slate-50 border border-slate-100 rounded-[30px] p-8 hover:-translate-y-2 transition-all duration-300 shadow-xl flex flex-col">
              <div className="mb-6">
                <span className="text-xs font-black text-[#2563EB] uppercase tracking-widest bg-[#2563EB]/10 px-3 py-1 rounded-full">Enterprise</span>
                <h3 className="text-3xl font-black text-slate-800 mt-4">Rs.9,999<span className="text-sm font-medium text-slate-400">/mo</span></h3>
                <p className="text-slate-500 text-xs mt-2">Custom rules for large-scale actors</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-2 text-slate-600 text-sm"><FaTasks className="text-[#2563EB]" /> Unlimited Employees</li>
                <li className="flex items-center gap-2 text-slate-600 text-sm"><FaTasks className="text-[#2563EB]" /> SLA Guarantee (99.9% Uptime)</li>
                <li className="flex items-center gap-2 text-slate-600 text-sm"><FaTasks className="text-[#2563EB]" /> Dedicated DevOps Panel Node</li>
                <li className="flex items-center gap-2 text-slate-600 text-sm"><FaTasks className="text-[#2563EB]" /> Custom Integrations</li>
              </ul>
              <Link href="/register?plan=ENTERPRISE&price=9999" className="w-full py-4 text-center bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-700 transition-colors text-sm uppercase tracking-wider">
                Contact Enterprise
              </Link>
            </div>
          </div>
        </div>

        {/* Security Measures Section */}
        <div id="security" className="w-full max-w-7xl mx-auto py-24 px-4 relative z-10 scroll-mt-12 border-t border-slate-100">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-6 tracking-tight">Security <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#2563EB]/50">Safeguards</span></h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">
              Multi-layered enterprise safety guardrails enforcing absolute data isolation and operation governance.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 w-full mb-16">
            <div className="bg-slate-50 border border-slate-100 shadow-xl rounded-[30px] p-8 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[#2563EB]/5 flex items-center justify-center mb-5 border border-[#2563EB]/10">
                <FaLock className="text-xl text-[#2563EB]" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Strong Authentication</h3>
              <p className="text-slate-500 text-xs leading-relaxed">Two-Factor Authentication (2FA) thresholds via OTP/email setups alongside strict password compliance layers.</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 shadow-xl rounded-[30px] p-8 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[#2563EB]/5 flex items-center justify-center mb-5 border border-[#2563EB]/10">
                <FaShieldAlt className="text-xl text-[#2563EB]" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Limited Access (Least Privilege)</h3>
              <p className="text-slate-500 text-xs leading-relaxed">Supreme actors govern tenants, but cannot directly Mutate regular operations unnecessarily for absolute safety standards.</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 shadow-xl rounded-[30px] p-8 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[#2563EB]/5 flex items-center justify-center mb-5 border border-[#2563EB]/10">
                <FaCode className="text-xl text-[#2563EB]" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Data Isolation (Multi-Tenant)</h3>
              <p className="text-slate-500 text-xs leading-relaxed">Strict `tenant_id` database row filtering rules with rigid authorization pipelines prevents cross-tenant leaks absolutely.</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 shadow-xl rounded-[30px] p-8 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[#2563EB]/5 flex items-center justify-center mb-5 border border-[#2563EB]/10">
                <FaTasks className="text-xl text-[#2563EB]" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Audit Logs</h3>
              <p className="text-slate-500 text-xs leading-relaxed">Deep operational transparency logging login timings, queries and modification vectors rigorously for inspection queues.</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 shadow-xl rounded-[30px] p-8 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[#2563EB]/5 flex items-center justify-center mb-5 border border-[#2563EB]/10">
                <FaGlobe className="text-xl text-[#2563EB]" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Session Management</h3>
              <p className="text-slate-500 text-xs leading-relaxed">Enforced auto-logout parameters for idle inactivity with rigid framing standards for secure authorization headers.</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 shadow-xl rounded-[30px] p-8 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[#2563EB]/5 flex items-center justify-center mb-5 border border-[#2563EB]/10">
                <FaUser className="text-xl text-[#2563EB]" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Role Restrictions</h3>
              <p className="text-slate-500 text-xs leading-relaxed">Strict bounding buffers separating top-level administration panel logic bounds cleanly from standard regular access hubs.</p>
            </div>
          </div>

        </div>

        {/* Footer Bottom Spacer */}
        <div className="h-12 w-full"></div>

      </main>

      {/* Contact Footer */}
      <footer className="w-full bg-slate-50 border-t border-slate-100 py-12 lg:py-16 px-4 z-20 relative">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">

          {/* Phone */}
          <div className="flex items-center gap-6 group cursor-pointer">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:border-[#2563EB]/50 group-hover:shadow-md transition-all duration-300">
              <FaPhoneAlt className="text-[#2563EB] text-xl group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-slate-800 font-bold text-lg tracking-wide flex items-center gap-3">
                +91 8891 257 161
                <span className="text-[10px] text-[#2563EB] font-black uppercase tracking-widest bg-[#2563EB]/10 border border-[#2563EB]/20 px-2 py-0.5 rounded-full">IN</span>
              </span>
              <span className="text-slate-400 font-medium text-sm mt-1">
                +1 415 555 0198 (INTL)
              </span>
            </div>
          </div>

          {/* Web */}
          <div className="flex items-center gap-6 group cursor-pointer">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:border-[#2563EB]/50 group-hover:shadow-md transition-all duration-300">
              <FaGlobe className="text-[#2563EB] text-xl group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-slate-800 font-bold text-lg tracking-wide">workhub.com</span>
              <span className="text-slate-400 font-medium text-sm mt-1 uppercase tracking-widest text-[#2563EB]">Enterprise Portal</span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-6 group cursor-pointer">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:border-[#2563EB]/50 group-hover:shadow-md transition-all duration-300">
              <FaMapMarkerAlt className="text-[#2563EB] text-xl group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-slate-800 font-bold text-lg tracking-wide">Global Distribution</span>
              <span className="text-slate-400 font-medium text-sm mt-1 uppercase tracking-widest text-[#2563EB]">All Locations</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
