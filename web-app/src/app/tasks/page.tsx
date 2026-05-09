"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Cookies from "js-cookie";
import { FaTasks, FaPlus, FaTimes, FaCheckCircle, FaClock, FaUserCircle, FaProjectDiagram, FaMapMarkerAlt } from "react-icons/fa";

const PROJECT_AREA_OPTIONS = [
    "Outlet",
    "Godown",
];

// Combined value helper: area options are stored with prefix "area:"
const AREA_PREFIX = "area:";

interface Task {
    id: number;
    title: string;
    project_title: string;
    project_area?: string;
    assigned_to: number;
    employee_code?: string;
    is_completed: boolean;
    manager_comment?: string;
}


interface Employee {
    id: number;
    display_name: string;
    employee_code: string;
}

interface Project {
    id: number;
    title: string;
    status: string;
}

const TasksPage = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState("");
    const [assignee, setAssignee] = useState("");
    const [projectId, setProjectId] = useState("");
    // projectSelection holds either "area:Dubai" or a numeric project id string
    const [projectSelection, setProjectSelection] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = Cookies.get("token");
            const { data } = await api.get("/api/tasks", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTasks(data);

            if (user?.role !== 'EMPLOYEE') {
                const [empRes, projRes] = await Promise.all([
                    api.get("/api/employees", { headers: { Authorization: `Bearer ${token}` } }),
                    api.get("/api/projects", { headers: { Authorization: `Bearer ${token}` } }),
                ]);
                setEmployees(empRes.data);
                setProjects(projRes.data);
                if (projRes.data.length > 0) setProjectId(String(projRes.data[0].id));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = Cookies.get("token");
            const isArea = projectSelection.startsWith(AREA_PREFIX);
            await api.post("/api/tasks", {
                title,
                assigned_to: assignee,
                project_id: isArea ? null : projectSelection,
                project_area: isArea ? projectSelection.replace(AREA_PREFIX, "") : null,
                criteria_json: {}
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setShowModal(false);
            fetchData();
            setTitle(""); setAssignee(""); setProjectSelection("");
        } catch (error) {
            console.error(error);
            alert("Failed to create task");
        }
    };

    const markComplete = async (taskId: number) => {
        try {
            const token = Cookies.get("token");
            await api.put(`/api/tasks/${taskId}`,
                { is_completed: true },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    if (!user) return null;

    return (
        <div className="p-8 bg-white min-h-screen text-slate-800 font-sans">
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-800">
                        Task <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Command</span>
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Oversee mission-critical objectives and milestones.</p>
                </div>
                {user.role !== 'EMPLOYEE' && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-8 py-4 bg-indigo-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
                    >
                        <FaPlus />
                        Deploy Objectives
                    </button>
                )}
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Fetching Intel...</p>
                </div>
            ) : (
                <div className="bg-slate-50 shadow-sm border border-slate-100 rounded-[32px] overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-white border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Objective</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Project / Outlet / Godown</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Personnel</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800 bg-slate-50/50">
                            {tasks.map((task) => (
                                <tr key={task.id} className="hover:bg-slate-100/50 transition-colors group">
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <p className="text-sm font-bold text-slate-800 tracking-tight">{task.title}</p>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            {task.project_area
                                                ? <FaMapMarkerAlt className="text-[10px] text-indigo-400" />
                                                : <FaProjectDiagram className="text-[10px] text-blue-400" />}
                                            <span className="text-xs font-medium">
                                                {task.project_area || task.project_title || 'N/A'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                                <FaUserCircle className="text-slate-400" />
                                            </div>
                                            <span className="text-xs font-bold text-slate-500">{task.employee_code || '---'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        {task.is_completed ? (
                                            <div className="flex items-center gap-2 text-green-400">
                                                <FaCheckCircle className="text-xs text-green-500" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Completed</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-yellow-400">
                                                <FaClock className="text-xs text-yellow-500 animate-pulse" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-right">
                                        {!task.is_completed && (
                                            <button
                                                onClick={() => markComplete(task.id)}
                                                className="text-[10px] font-black text-indigo-400 hover:text-white transition-colors uppercase tracking-widest border border-indigo-400/30 px-4 py-2 rounded-xl hover:bg-indigo-600"
                                            >
                                                Finalize
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-50 shadow-2xl border border-slate-100 rounded-[40px] p-10 w-full max-w-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-3xl font-black text-slate-800">New <span className="text-blue-600">Objective</span></h2>
                                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Deploy Strategic Tasks</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-all border border-slate-200 shadow-sm">
                                <FaTimes className="text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Objective Title</label>
                                <input type="text" placeholder="Design Cloud Architecture..." value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-6 text-slate-800 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all font-medium" required />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Personnel Assignment</label>
                                <select value={assignee} onChange={e => setAssignee(e.target.value)} className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-6 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all font-medium appearance-none" required>
                                    <option value="" className="bg-slate-50">Select Personnel...</option>
                                    {employees
                                        .filter(e => user.role !== 'MANAGER' || e.display_name !== user.name)
                                        .map(e => <option key={e.id} value={String(e.id)} className="bg-slate-50">{e.display_name} ({e.employee_code})</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project / Outlet / Godown</label>
                                <select
                                    value={projectSelection}
                                    onChange={e => setProjectSelection(e.target.value)}
                                    className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-6 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all font-medium appearance-none"
                                    required
                                >
                                    <option value="">Select Project, Outlet, or Godown...</option>
                                    {projects.length > 0 && (
                                        <optgroup label="── Projects ──">
                                            {projects.map(p => (
                                                <option key={p.id} value={String(p.id)}>{p.title}</option>
                                            ))}
                                        </optgroup>
                                    )}
                                    <optgroup label="── Outlet / Godown ──">
                                        {PROJECT_AREA_OPTIONS.map(area => (
                                            <option key={area} value={`${AREA_PREFIX}${area}`}>{area}</option>
                                        ))}
                                    </optgroup>
                                </select>
                            </div>

                            <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 mt-4 active:scale-95">
                                Deploy Objective
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TasksPage;


