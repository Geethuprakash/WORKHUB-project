import axios from "axios";
import Cookies from "js-cookie";

export const API_BASE_URL = "http://127.0.0.1:5001";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token = Cookies.get("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 400) {
            console.error("400 Bad Request:", error.config.url, error.response.data);
        }
        if (error.response?.status === 401) {
            console.error("401 Unauthorized - Token may be invalid or expired.");
            
            if (error.config?.url?.includes("/api/auth/login")) {
                return Promise.reject(error);
            }

            const userInfo = Cookies.get("userInfo");
            const role = userInfo ? JSON.parse(userInfo).role : null;

            Cookies.remove("token");
            Cookies.remove("userInfo");

            if (typeof window !== "undefined") {
                if (role === "SUPER_ADMIN") {
                    window.location.href = "/superadmin-login";
                } else {
                    window.location.href = "/login";
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
