import axios, { isAxiosError } from "axios";
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";

// Gunakan base URL dari environment variable
const API_VERSION: string = "v1";
// Jika VITE_BASE_URL diset (mis. http://192.168.1.42:8000) gunakan itu + /api/v1,
// jika tidak gunakan fallback relatif '/api/v1' sehingga Vite proxy dapat meneruskannya.
const BASE_URL: string = import.meta.env.VITE_BASE_URL
    ? `${import.meta.env.VITE_BASE_URL.replace(/\/$/, '')}/api/${API_VERSION}`
    : `/api/${API_VERSION}`;

// Instance Axios
const axiosCustom = axios.create({
    baseURL: BASE_URL,
});

// Interceptor untuk tambahkan Bearer Token dan user_id
axiosCustom.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // const cookieData = null;

        // let authUser: AuthUser | null = null;

        // if (cookieData) {
        //     // Coba parse jika data disimpan sebagai JSON string, jika tidak, gunakan langsung
        //     try {
        //         authUser = typeof cookieData === 'string' ? JSON.parse(cookieData) : cookieData as AuthUser;
        //     } catch (e) {
        //         // Jika gagal parsing, mungkin itu sudah objek atau data rusak
        //         console.error("Failed to parse 'auth' cookie:", e);
        //         authUser = cookieData as AuthUser;
        //     }
        // }

        // const authUserId = authUser?.id || null;
        // const bearerToken = authUser?.token;
        const authUserId: number | null = null;
        const bearerToken: string | null = null;

        if (bearerToken) {
            config.headers.Authorization = `Bearer ${bearerToken}`;
        }

        const method = config.method?.toLowerCase();

        // 1. Logika untuk menambahkan auth_user_id ke body (POST, PUT, PATCH)
        if (method !== "get" && method !== "delete") {
            // Cek apakah data BUKAN FormData
            if (!(config.data instanceof FormData)) {
                // Pastikan config.data adalah objek
                const data = (config.data || {}) as Record<string, any>;

                config.data = {
                    ...data,
                    auth_user_id: authUserId,
                };
            }
        }

        // 2. Logika untuk menambahkan auth_user_id ke params (GET, DELETE)
        else if (method === "get" || method === "delete") {
            // Pastikan config.params adalah objek
            const params = (config.params || {}) as Record<string, any>;

            config.params = {
                ...params,
                auth_user_id: authUserId,
            };
        }

        // Tambahkan header X-Requested-With
        config.headers['X-Requested-With'] = 'XMLHttpRequest';

        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Interceptor untuk response
axiosCustom.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error) => {
        // Hanya log error jika tidak dalam lingkungan pengujian
        if (process.env.NODE_ENV !== 'test') {
            if (isAxiosError(error)) {
                console.error('❌ Axios Error:', {
                    message: error.message,
                    code: error.code,
                    config: {
                        url: error.config?.url,
                        baseURL: error.config?.baseURL,
                        method: error.config?.method,
                        headers: error.config?.headers,
                    },
                    response: error.response?.status,
                    networkError: !error.response,
                });
            } else {
                console.error('❌ Non-Axios Error:', error);
            }
        }
        return Promise.reject(error);
    }
);

export { isAxiosError };
export default axiosCustom;
