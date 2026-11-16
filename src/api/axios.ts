import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { clearSession, getAccessToken, getRefreshToken, saveSession } from "../utils/storage";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const AUTH_PATHS = ["/auth/login", "/auth/register", "/auth/refresh"];
let refreshing: Promise<string> | null = null;

// one refresh request at a time; every failed request waits for the same promise
const refreshAccessToken = (): Promise<string> => {
  if (!refreshing) {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return Promise.reject(new Error("No refresh token"));
    refreshing = axios
      .post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken })
      .then((res) => {
        saveSession(res.data.data);
        return res.data.data.accessToken as string;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
};

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const isAuthCall = AUTH_PATHS.some((p) => original?.url?.includes(p));

    if (error.response?.status === 401 && original && !original._retry && !isAuthCall && getRefreshToken()) {
      original._retry = true;
      try {
        const token = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch {
        clearSession();
        window.dispatchEvent(new Event("auth:logout"));
      }
    }
    return Promise.reject(error);
  }
);
