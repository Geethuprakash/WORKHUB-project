"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import axios from "axios";

interface User {
    _id: number;
    name: string;
    email: string;
    role: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "EMPLOYEE";
    tenant_code?: string;
    token: string;
}

interface AuthContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const token = Cookies.get("token");
            const userInfo = Cookies.get("userInfo");

            if (token && userInfo) {
                setUser(JSON.parse(userInfo));
                // Optional: Verify token with backend here
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        Cookies.set("token", userData.token, { expires: 30 }); // 30 days
        Cookies.set("userInfo", JSON.stringify(userData), { expires: 30 });

        // Redirect based on role
        if (userData.role === "SUPER_ADMIN") {
            router.push("/tenants");
        } else if (userData.role === "ADMIN") {
            router.push("/dashboard/admin");
        } else if (userData.role === "MANAGER") {
            router.push("/dashboard/manager");
        } else if (userData.role === "EMPLOYEE") {
            router.push("/dashboard/employee");
        } else {
            router.push("/dashboard/employee"); // Fallback
        }
    };

    const logout = () => {
        setUser(null);
        Cookies.remove("token");
        Cookies.remove("userInfo");
        router.push("/login"); // Redirect to login
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
