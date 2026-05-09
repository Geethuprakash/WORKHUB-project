"use client";

import { useState, useEffect, Suspense } from "react";
import api from "@/lib/api";
import {
    FaLock, FaEnvelope, FaRocket, FaShieldAlt, FaBuilding,
    FaUser, FaCode, FaFileAlt, FaIdCard, FaArrowRight, FaArrowLeft, FaCheckCircle, FaMapMarkerAlt
} from "react-icons/fa";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const PLAN_CONFIG: Record<string, { label: string; price: number; color: string; bg: string; border: string }> = {
    BASIC:      { label: "Starter",    price: 999,  color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-200" },
    PRO:        { label: "Pro",        price: 2999, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200" },
    ENTERPRISE: { label: "Enterprise", price: 9999, color: "text-slate-800",  bg: "bg-slate-100", border: "border-slate-300" },
};

// Extend the window object for Razorpay
declare global {
    interface Window { Razorpay: any; }
}

function RegisterForm() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const planFromUrl = (searchParams.get("plan") || "BASIC").toUpperCase();

    const [step, setStep] = useState<1 | 2>(1);

    // Step 1 fields
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [organizationName, setOrganizationName] = useState("");
    const [projectArea, setProjectArea] = useState("");
    const [tenantCode, setTenantCode] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [criterias, setCriterias] = useState("");
    const [licenseNumber, setLicenseNumber] = useState("");
    const [gstNumber, setGstNumber] = useState("");

    // Step 2 -- plan selection
    const [selectedPlan, setSelectedPlan] = useState(planFromUrl);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const planInfo = PLAN_CONFIG[selectedPlan] || PLAN_CONFIG["BASIC"];

    // Load Razorpay script dynamically
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        return () => { document.body.removeChild(script); };
    }, []);

    const handleStep1 = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setStep(2);
    };

    const doRegister = async (planType: string, paymentId: string, orderId: string) => {
        const { data } = await api.post("/api/auth/register", {
            organization_name: organizationName,
            project_area: projectArea,
            tenant_code: tenantCode.toUpperCase(),
            email,
            password,
            display_name: displayName,
            criterias,
            license_number: licenseNumber,
            gst_number: gstNumber,
            plan_type: planType,
            payment_status: "PAID",
            amount_paid: PLAN_CONFIG[planType]?.price || 0,
        });
        return data;
    };

    const handleRazorpayPayment = async () => {
        setLoading(true);
        setError("");
        try {
            // 1. Create Razorpay Order on backend
            const { data: orderData } = await api.post("/api/payment/create-order", {
                amount: planInfo.price,
                plan_type: selectedPlan,
            });

            // 2. Open Razorpay Checkout Modal
            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "WorkHub",
                description: `${planInfo.label} Plan Subscription`,
                order_id: orderData.orderId,
                theme: { color: "#2563EB" },
                prefill: {
                    name: displayName,
                    email: email,
                },
                handler: async (response: any) => {
                    try {
                        // 3. Verify payment signature
                        const { data: verifyData } = await api.post("/api/payment/verify", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        if (verifyData.success) {
                            // 4. Register org in DB
                            await doRegister(selectedPlan, response.razorpay_payment_id, response.razorpay_order_id);
                            setSuccess("[OK] Payment successful! Your organization is registered. Redirecting...");
                            setTimeout(() => router.push("/login"), 2500);
                        } else {
                            setError("Payment verification failed. Please contact support.");
                        }
                    } catch (err: any) {
                        setError(err.response?.data?.message || "Registration failed after payment.");
                    } finally {
                        setLoading(false);
                    }
                },
                modal: {
                    ondismiss: () => {
                        setLoading(false);
                        setError("Payment was cancelled. Please try again.");
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to initiate payment. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col relative overflow-hidden font-sans text-slate-800">
            {/* Background Orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] animate-pulse pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px] animate-pulse pointer-events-none" style={{ animationDelay: "3s" }}></div>



            <div className="flex-1 flex flex-col items-center p-6 relative z-10 w-full overflow-y-auto">
                <div className="w-full max-w-2xl py-8 my-auto">

                    {/* Branding */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-[0_0_50px_rgba(37,99,235,0.2)]">
                            <FaRocket className="text-white text-2xl" />
                        </div>
                        <h1 className="text-4xl font-black text-slate-800 tracking-tighter">
                            Work<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Hub</span>
                        </h1>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-1">Enterprise Intelligence Portal</p>
                    </div>

                    {/* Step Indicator */}
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${step === 1 ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-green-100 text-green-700"}`}>
                            {step > 1 ? <FaCheckCircle /> : <span>1</span>} Organization Details
                        </div>
                        <div className="w-8 h-px bg-slate-200"></div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${step === 2 ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-slate-100 text-slate-400"}`}>
                            <span>2</span> Choose Plan & Pay
                        </div>
                    </div>

                    {/* Card */}
                    <div className="bg-slate-50 border border-slate-100 p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-50"></div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs text-center font-semibold">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-600 text-sm text-center font-semibold animate-pulse">
                                {success}
                            </div>
                        )}

                        {/* -------- STEP 1: Organization Info -------- */}
                        {step === 1 && (
                            <>
                                <div className="mb-8 text-center">
                                    <h2 className="text-2xl font-bold text-slate-800 mb-1">Initialize Instance</h2>
                                    <p className="text-slate-400 text-sm">Step 1 of 2 - Organization Details</p>
                                </div>
                                <form onSubmit={handleStep1} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2 group/field">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within/field:text-blue-500 transition-colors">Organization Name</label>
                                            <div className="relative">
                                                <FaBuilding className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/field:text-blue-500 transition-colors" />
                                                <input type="text" placeholder="VoltCorp LLC" value={organizationName} onChange={e => setOrganizationName(e.target.value)}
                                                    className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600/50 focus:ring-4 focus:ring-blue-600/10 transition-all font-medium" required />
                                            </div>
                                        </div>
                                        <div className="space-y-2 group/field">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within/field:text-blue-500 transition-colors">Project Area</label>
                                            <div className="relative">
                                                <FaMapMarkerAlt className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/field:text-blue-500 transition-colors" />
                                                <input type="text" placeholder="Dubai / New York" value={projectArea} onChange={e => setProjectArea(e.target.value)}
                                                    className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600/50 focus:ring-4 focus:ring-blue-600/10 transition-all font-medium" required />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 group/field">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within/field:text-blue-500 transition-colors">Tenant Code</label>
                                        <div className="relative">
                                            <FaCode className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/field:text-blue-500 transition-colors" />
                                            <input type="text" placeholder="VOLT" value={tenantCode} onChange={e => setTenantCode(e.target.value)}
                                                className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600/50 focus:ring-4 focus:ring-blue-600/10 transition-all font-medium uppercase" required />
                                        </div>
                                    </div>

                                    <div className="space-y-2 group/field">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within/field:text-blue-500 transition-colors">Administrator Full Name</label>
                                        <div className="relative">
                                            <FaUser className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/field:text-blue-500 transition-colors" />
                                            <input type="text" placeholder="John Doe" value={displayName} onChange={e => setDisplayName(e.target.value)}
                                                className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600/50 focus:ring-4 focus:ring-blue-600/10 transition-all font-medium" required />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2 group/field">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within/field:text-blue-500 transition-colors">Identifier (Email)</label>
                                            <div className="relative">
                                                <FaEnvelope className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/field:text-blue-500 transition-colors" />
                                                <input type="email" placeholder="admin@voltcorp.com" value={email} onChange={e => setEmail(e.target.value)}
                                                    className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600/50 focus:ring-4 focus:ring-blue-600/10 transition-all font-medium" required />
                                            </div>
                                        </div>
                                        <div className="space-y-2 group/field">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within/field:text-blue-500 transition-colors">Passkey</label>
                                            <div className="relative">
                                                <FaLock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/field:text-blue-500 transition-colors" />
                                                <input type="password" placeholder="********" value={password} onChange={e => setPassword(e.target.value)}
                                                    className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600/50 focus:ring-4 focus:ring-blue-600/10 transition-all font-medium" required />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2 group/field">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within/field:text-blue-500 transition-colors">License No</label>
                                            <div className="relative">
                                                <FaIdCard className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/field:text-blue-500 transition-colors" />
                                                <input type="text" placeholder="LIC-120039" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)}
                                                    className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600/50 focus:ring-4 focus:ring-blue-600/10 transition-all font-medium" required />
                                            </div>
                                        </div>
                                        <div className="space-y-2 group/field">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within/field:text-blue-500 transition-colors">GST ID</label>
                                            <div className="relative">
                                                <FaFileAlt className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/field:text-blue-500 transition-colors" />
                                                <input type="text" placeholder="22AAAAA000A1Z5" value={gstNumber} onChange={e => setGstNumber(e.target.value)}
                                                    className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600/50 focus:ring-4 focus:ring-blue-600/10 transition-all font-medium" required />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 group/field">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within/field:text-blue-500 transition-colors">Company Criteria / Details</label>
                                        <textarea placeholder="Registration reasons and enterprise operational targets..." value={criterias} onChange={e => setCriterias(e.target.value)}
                                            className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-6 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600/50 focus:ring-4 focus:ring-blue-600/10 transition-all font-medium min-h-[100px]" required />
                                    </div>

                                    <button type="submit"
                                        className="w-full relative group/btn overflow-hidden bg-blue-600 text-white font-black py-5 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 uppercase tracking-widest text-sm">
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                                        <span className="relative z-10">Next</span>
                                        <FaArrowRight className="relative z-10" />
                                    </button>
                                </form>
                            </>
                        )}

                        {/* -------- STEP 2: Plan Selection + Razorpay -------- */}
                        {step === 2 && (
                            <>
                                <div className="mb-8 text-center">
                                    <h2 className="text-2xl font-bold text-slate-800 mb-1">Choose Your Plan</h2>
                                    <p className="text-slate-400 text-sm">Step 2 of 2 - Pay securely via Razorpay</p>
                                </div>

                                {/* Plan Cards */}
                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    {Object.entries(PLAN_CONFIG).map(([key, cfg]) => (
                                        <button key={key} type="button" onClick={() => setSelectedPlan(key)}
                                            className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 hover:scale-[1.03] ${selectedPlan === key ? "border-blue-600 bg-blue-50 shadow-lg shadow-blue-600/10" : "border-slate-200 bg-white hover:border-blue-300"}`}>
                                            <p className={`text-xs font-black uppercase tracking-widest mb-2 ${selectedPlan === key ? "text-blue-600" : "text-slate-500"}`}>{cfg.label}</p>
                                            <p className={`text-2xl font-black ${selectedPlan === key ? "text-blue-700" : "text-slate-800"}`}>
                                                Rs.{cfg.price.toLocaleString()}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-medium mt-1">per month</p>
                                            {selectedPlan === key && (
                                                <div className="mt-2 flex items-center gap-1 text-blue-600 text-[10px] font-black uppercase tracking-wide">
                                                    <FaCheckCircle className="text-xs" /> Selected
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Summary Banner */}
                                <div className={`mb-6 p-5 rounded-2xl border-2 ${planInfo.border} ${planInfo.bg} flex items-center justify-between`}>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">You selected</p>
                                        <p className={`text-xl font-black ${planInfo.color}`}>{planInfo.label} Plan</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Total Due</p>
                                        <p className={`text-3xl font-black ${planInfo.color}`}>Rs.{planInfo.price.toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Razorpay badge */}
                                <div className="flex items-center gap-3 p-3 bg-slate-100 border border-slate-200 rounded-xl mb-6">
                                    <FaShieldAlt className="text-blue-600 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-bold text-slate-700">Powered by Razorpay</p>
                                        <p className="text-[10px] text-slate-500">UPI | Cards | Net Banking | Wallets - all in one secure checkout</p>
                                    </div>
                                    <img src="https://razorpay.com/favicon.png" alt="Razorpay" className="w-6 h-6 ml-auto rounded" />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4">
                                    <button type="button" onClick={() => { setStep(1); setError(""); }}
                                        className="flex items-center gap-2 px-6 py-4 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-colors text-sm uppercase tracking-wider">
                                        <FaArrowLeft /> Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleRazorpayPayment}
                                        disabled={loading}
                                        className="flex-1 relative group/btn overflow-hidden bg-blue-600 text-white font-black py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-blue-600/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                                        <span className="relative z-10">
                                            {loading ? "Processing..." : `Pay Rs.${planInfo.price.toLocaleString()} via Razorpay`}
                                        </span>
                                        {!loading && <FaShieldAlt className="relative z-10" />}
                                    </button>
                                </div>
                            </>
                        )}

                        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                            <p className="text-slate-400 text-xs font-medium">
                                Already have an account?{" "}
                                <Link href="/login" className="text-blue-500 font-bold hover:text-blue-400 transition-colors underline underline-offset-4 decoration-blue-500/30">
                                    Login Here
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400 font-bold">Loading...</div>}>
            <RegisterForm />
        </Suspense>
    );
}
