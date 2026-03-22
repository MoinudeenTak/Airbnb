import axios from "axios";

/*
|--------------------------------------------------------------------------
| Storage Helpers
|--------------------------------------------------------------------------
*/

const STORAGE_KEYS = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  rememberMe: "rememberMe",
};

const getAccessToken = () =>
  localStorage.getItem(STORAGE_KEYS.accessToken) ||
  sessionStorage.getItem(STORAGE_KEYS.accessToken);

const getRefreshToken = () =>
  localStorage.getItem(STORAGE_KEYS.refreshToken) ||
  sessionStorage.getItem(STORAGE_KEYS.refreshToken);

const getRememberMe = () =>
  localStorage.getItem(STORAGE_KEYS.rememberMe) === "true" ||
  sessionStorage.getItem(STORAGE_KEYS.rememberMe) === "true";

const getStorage = () => (getRememberMe() ? localStorage : sessionStorage);

const clearAuthStorage = () => {
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
  localStorage.removeItem(STORAGE_KEYS.rememberMe);

  sessionStorage.removeItem(STORAGE_KEYS.accessToken);
  sessionStorage.removeItem(STORAGE_KEYS.refreshToken);
  sessionStorage.removeItem(STORAGE_KEYS.rememberMe);
};

const storeAccessToken = (token) => {
  if (!token) return;

  const storage = getStorage();
  storage.setItem(STORAGE_KEYS.accessToken, token);
};

const baseURL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/*
|--------------------------------------------------------------------------
| Axios Instances
|--------------------------------------------------------------------------
*/

const api = axios.create({
  baseURL,
  withCredentials: false,
});

const refreshApi = axios.create({
  baseURL,
  withCredentials: false,
});

/*
|--------------------------------------------------------------------------
| Request Interceptor
|--------------------------------------------------------------------------
*/

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/*
|--------------------------------------------------------------------------
| Response Interceptor
|--------------------------------------------------------------------------
*/

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });

  failedQueue = [];
};

const authExcludedUrls = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/google",
  "/auth/facebook",
  "/auth/refresh-token",
];

const shouldSkipRefresh = (url = "") => {
  return authExcludedUrls.some((excludedUrl) => url.includes(excludedUrl));
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const requestUrl = originalRequest?.url || "";

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (status !== 401 || shouldSkipRefresh(requestUrl)) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      clearAuthStorage();

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }

      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      clearAuthStorage();

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }

      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newAccessToken) => {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        })
        .catch((queueError) => Promise.reject(queueError));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await refreshApi.post("/auth/refresh-token", {
        token: refreshToken,
      });

      const data = response?.data || {};
      const newAccessToken = data?.accessToken;

      if (!newAccessToken) {
        throw new Error("No new access token returned");
      }

      storeAccessToken(newAccessToken);
      processQueue(null, newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearAuthStorage();

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;