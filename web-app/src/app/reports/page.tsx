"use client";

import { useEffect, useState } from "react";
import { FaFilePdf, FaBuilding, FaUsers, FaProjectDiagram, FaTasks } from "react-icons/fa";
import api from "../../lib/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ReportData {
    organization: any;
    summary: any;
    employeesList: any[];
    projectsList: any[];
    departmentsList: any[];
    tasksList: any[];
    assetsList: any[];
}

export default function ReportsPage() {
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const { data } = await api.get('/api/dashboard/report');
                setReportData(data);
            } catch (error) {
                console.error("Failed to fetch report data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, []);

    const generatePDF = () => {
        if (!reportData) return;
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(22);
        doc.setTextColor(37, 99, 235); // Blue
        doc.text("Company Comprehensive Report", 14, 22);
        
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Organization: ${reportData.organization.organization_name || 'N/A'}`, 14, 32);
        doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 14, 38);

        // Summary Statistics Section
        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.text("Summary Statistics", 14, 52);

        const summaryBody = [
            ["Total Employees", reportData.summary.totalEmployees.toString()],
            ["Active Employees", reportData.summary.activeEmployees.toString()],
            ["Total Departments", reportData.summary.totalDepartments.toString()],
            ["Total Projects", reportData.summary.totalProjects.toString()],
            ["Ongoing Projects", reportData.summary.ongoingProjects.toString()],
            ["Total Tasks", reportData.summary.totalTasks.toString()],
            ["Completed Tasks", reportData.summary.completedTasks.toString()],
            ["Total Assets", reportData.summary.totalAssets.toString()],
        ];

        autoTable(doc, {
            startY: 56,
            head: [["Metric", "Value"]],
            body: summaryBody,
            theme: 'striped',
            headStyles: { fillColor: [37, 99, 235] } // Blue
        });

        // Departments Section
        doc.addPage();
        doc.setFontSize(16);
        doc.text("Departments Overview", 14, 22);

        const deptBody = reportData.departmentsList.map(d => [
            d.name,
            d.employees.toString(),
            d.status
        ]);

        autoTable(doc, {
            startY: 28,
            head: [["Department Name", "Total Employees", "Status"]],
            body: deptBody,
            theme: 'grid',
            headStyles: { fillColor: [37, 99, 235] }
        });

        // Employees Section
        doc.addPage();
        doc.setFontSize(16);
        doc.text("Employee Directory", 14, 22);

        const empBody = reportData.employeesList.map(e => [
            e.code || 'N/A', 
            e.name || 'N/A',
            e.email || 'N/A',
            e.department || 'N/A',
            e.salary ? `$${Number(e.salary).toLocaleString()}` : '$0',
            e.status, 
            e.joined ? new Date(e.joined).toLocaleDateString() : 'N/A'
        ]);

        autoTable(doc, {
            startY: 28,
            head: [["Code", "Name", "Email", "Dept", "Salary", "Status", "Joined"]],
            body: empBody,
            theme: 'grid',
            headStyles: { fillColor: [37, 99, 235] },
            styles: { fontSize: 7 }
        });

        // Projects Section
        doc.addPage();
        doc.setFontSize(16);
        doc.text("Projects Detailed Overview", 14, 22);

        const projBody = reportData.projectsList.map(p => [
            p.title || 'N/A', 
            p.client || 'N/A', 
            p.manager || 'N/A',
            p.status, 
            p.revenue ? `$${p.revenue}` : 'N/A',
            p.deadline ? new Date(p.deadline).toLocaleDateString() : 'N/A'
        ]);

        autoTable(doc, {
            startY: 28,
            head: [["Project Title", "Client", "Manager", "Status", "Revenue", "Deadline"]],
            body: projBody,
            theme: 'grid',
            headStyles: { fillColor: [37, 99, 235] }
        });

        // Tasks Section
        doc.addPage();
        doc.setFontSize(16);
        doc.text("Tasks Assignments", 14, 22);

        const taskBody = reportData.tasksList.map(t => [
            t.title,
            t.project,
            t.assigned,
            t.status
        ]);

        autoTable(doc, {
            startY: 28,
            head: [["Task Title", "Project", "Assigned To", "Status"]],
            body: taskBody,
            theme: 'grid',
            headStyles: { fillColor: [37, 99, 235] }
        });

        // Assets Section
        doc.addPage();
        doc.setFontSize(16);
        doc.text("Company Assets", 14, 22);

        const assetBody = reportData.assetsList.map(a => [
            a.name,
            a.serial,
            a.status,
            a.assigned
        ]);

        autoTable(doc, {
            startY: 28,
            head: [["Asset Name", "Serial No", "Status", "Assigned To"]],
            body: assetBody,
            theme: 'grid',
            headStyles: { fillColor: [37, 99, 235] }
        });

        // Save
        doc.save(`${reportData.organization.organization_name || 'Company'}_Full_Report.pdf`);
    };

    if (loading) return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Gathering company report...</div>;
    if (!reportData) return <div className="p-8 text-center text-red-500 font-medium">Failed to load report data.</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Company Report</h1>
                    <p className="text-slate-500 font-medium mt-1">Comprehensive overview of {reportData.organization.organization_name}</p>
                </div>
                <button 
                    onClick={generatePDF}
                    className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-500/30 object-contain hover:-translate-y-0.5"
                >
                    <FaFilePdf size={20} />
                    Export as PDF
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Employees" value={reportData.summary.totalEmployees} icon={<FaUsers />} color="bg-blue-600 text-blue-600" />
                <StatCard title="Total Departments" value={reportData.summary.totalDepartments} icon={<FaBuilding />} color="bg-blue-600 text-blue-600" />
                <StatCard title="Ongoing Projects" value={reportData.summary.ongoingProjects} icon={<FaProjectDiagram />} color="bg-blue-600 text-blue-600" />
                <StatCard title="Tasks Completed" value={`${reportData.summary.completedTasks} / ${reportData.summary.totalTasks}`} icon={<FaTasks />} color="bg-blue-600 text-blue-600" />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 h-96 flex flex-col justify-center items-center text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <FaFilePdf size={32} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-700">Detailed Report Ready</h3>
                <p className="text-slate-500 mt-2 max-w-sm">
                    Click the Export as PDF button above to download a comprehensive report including all employees, projects, and structural statistics for your entire company.
                </p>
                <button 
                    onClick={generatePDF}
                    className="mt-6 text-indigo-600 font-bold hover:text-indigo-800 transition-colors underline decoration-2 underline-offset-4"
                >
                    Download Now
                </button>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color }: { title: string, value: string | number, icon: any, color: string }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-opacity-10 ${color.split(' ')[0]} bg-opacity-10 ${color.split(' ')[1]}`}>
                <div className="text-2xl">{icon}</div>
            </div>
            <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{title}</p>
                <p className="text-2xl font-black text-slate-800">{value}</p>
            </div>
        </div>
    );
}
