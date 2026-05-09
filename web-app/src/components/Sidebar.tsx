"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaUsers, FaTasks, FaMoneyBillWave, FaBuilding, FaUserTie, FaSignOutAlt, FaUser, FaQuestionCircle } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    if (!user) return null;

    const links = [
        { name: "Dashboard", href: `/dashboard/${user.role?.toLowerCase()}`, icon: <FaHome />, roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
        { name: "Profile", href: "/profile", icon: <FaUser />, roles: ["MANAGER", "EMPLOYEE"] },
        { name: "Tenants", href: "/tenants", icon: <FaBuilding />, roles: ["SUPER_ADMIN"] },
        { name: "Departments", href: "/departments", icon: <FaBuilding />, roles: ["ADMIN"] },
        { name: "Employees", href: "/employees", icon: <FaUsers />, roles: ["ADMIN", "MANAGER"] },
        { name: "Tasks", href: "/tasks", icon: <FaTasks />, roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
        { name: "Attendance", href: "/attendance", icon: <FaUserTie />, roles: ["EMPLOYEE", "ADMIN", "MANAGER"] },
        { name: "Finances", href: "/finances", icon: <FaMoneyBillWave />, roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
        { name: "Reports", href: "/reports", icon: <FaBuilding />, roles: ["ADMIN"] },
        { name: "Enquiries", href: "/enquiries", icon: <FaQuestionCircle />, roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
    ];

    // Filter links by role
    const filteredLinks = links.filter(link => link.roles.includes(user.role));

    return (
        <div className="flex flex-col w-72 h-screen px-6 py-8 bg-white border-r border-slate-100 font-sans shadow-2xl">
            <div className="text-3xl font-black text-slate-800 px-2 mb-10 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.3)]"></div>
                {['SUPER_ADMIN', 'ADMIN'].includes(user.role) ? 'WORKHUB' : 'TENACTO'}
            </div>
            <div className="flex flex-col justify-between flex-1 mt-6">
                <nav className="space-y-2">
                    {filteredLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex items-center px-4 py-3.5 text-slate-500 transition-all duration-300 rounded-2xl group ${pathname === link.href ? "bg-indigo-600/10 shadow-[0_0_20px_rgba(79,70,229,0.1)] text-indigo-600 active-link" : "hover:bg-slate-100/50 hover:text-indigo-600"
                                }`}
                        >
                            <span className={`w-5 h-5 transition-transform group-hover:scale-110 ${pathname === link.href ? "text-indigo-500" : "text-slate-400"}`}>{link.icon}</span>
                            <span className="mx-4 font-semibold tracking-tight">{link.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="mt-auto">
                    {user.role !== 'SUPER_ADMIN' && (
                        <div className="mb-4 px-4 py-3 bg-slate-50 shadow-sm rounded-2xl border border-slate-100 relative group/profile">
                            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Logged in as</p>
                            <p className="text-sm font-bold text-slate-800 mt-1 truncate">{user.name}</p>
                            <p className="text-[10px] text-indigo-400 font-medium uppercase mt-0.5">{user.role}</p>
                        </div>
                    )}
                    <div className="flex items-center px-4 py-3.5 text-red-400/80 transition-all duration-300 rounded-2xl hover:bg-red-500/10 hover:text-red-400 cursor-pointer group" onClick={logout}>
                        <span className="w-5 h-5 transition-transform group-hover:rotate-12"><FaSignOutAlt /></span>
                        <span className="mx-4 font-bold tracking-tight">Logout</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;


