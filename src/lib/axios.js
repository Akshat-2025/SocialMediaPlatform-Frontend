import axios from "axios";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// withCredentials is required in every request since the API auths via
// httpOnly cookies (access + refresh) and frontend/backend live on different
// origins in production (SameSite=None; Secure on the backend side).
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// --- Silent refresh-on-401 -------------------------------------------------
// The access-token cookie is short-lived (15m). On a 401 from any protected
// route we try /auth/refresh once; if it succeeds we retry the original
// request, otherwise we let the 401 propagate (caller/UI treats it as
// "logged out"). Concurrent 401s share a single in-flight refresh call.

let refreshPromise = null;
let onUnauthorized = null;

/** Registered once by <Providers> so the interceptor can clear client auth state. */
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

const AUTH_EXEMPT = ["/auth/login", "/auth/register", "/auth/refresh"];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    const isExempt = AUTH_EXEMPT.some((path) => config?.url?.includes(path));

    if (response?.status === 401 && !config._retry && !isExempt) {
      config._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = api.post("/auth/refresh").finally(() => {
            refreshPromise = null;
          });
        }
        await refreshPromise;
        return api(config);
      } catch (refreshError) {
        onUnauthorized?.();
        return Promise.reject(refreshError);
      }
    }

    if (response?.status === 401 && isExempt === false && config._retry) {
      onUnauthorized?.();
    }

    return Promise.reject(error);
  }
);

/** Pulls a consistent { message, errors } shape out of any API error. */
export function apiErrorMessage(error) {
  const data = error?.response?.data;
  if (data?.errors?.length) {
    return data.errors.map((e) => e.message).join(", ");
  }
  return data?.message || error?.message || "Something went wrong";
}
