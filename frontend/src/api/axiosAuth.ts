import axios from "axios";

// Динамический API URL
// Локально: используется proxy через Vite (localhost:5173/api -> localhost:8000/api)
// Продакшен: используется абсолютный путь или переменная окружения
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const axiosAuth = axios.create({
  baseURL: API_BASE_URL,
});


axiosAuth.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


let isRefreshing = false;
let failedQueue: {
  resolve: (token?: string | null | undefined) => void;
  reject: (err?: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

axiosAuth.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // если 401 и еще не было retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh");

      if (!refreshToken) {
        // нет refresh token → logout
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.reload();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Уже идёт обновление токена, ждем его
        return new Promise<string | null | undefined>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosAuth(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const refreshUrl = `${axiosAuth.defaults.baseURL}/users/token/refresh/`;
        const res = await axios.post(refreshUrl, { refresh: refreshToken });
        const newAccess = res.data.access;
        if (!newAccess) throw new Error("No access token in refresh response");

        localStorage.setItem("access", newAccess);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        processQueue(null, newAccess);

        return axiosAuth(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.reload();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
