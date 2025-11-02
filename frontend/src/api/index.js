import axios from "axios";

/* =====================================================
   🌐 Axios Global API Setup
   Dynamically switches between local and live environments.
===================================================== */

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    (window.location.hostname.includes("rabwahbag.com")
      ? "https://rabwahbag.com/api"
      : "http://localhost:5000/api"),
  timeout: 15000, // ⏱️ Slightly higher for slower connections
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/* =====================================================
   🔐 JWT Token Interceptor
   Automatically attaches the auth token for all requests
===================================================== */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("rabwah_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 🧠 Optional debug headers
    config.headers["X-Client-App"] = "Rabwah-Factory-Frontend";
    config.headers["X-Request-Timestamp"] = new Date().toISOString();

    return config;
  },
  (error) => {
    console.error("❌ Axios Request Error:", error.message);
    return Promise.reject(error);
  }
);

/* =====================================================
   ⚠️ Global Response Interceptor
   Handles token expiry, forbidden access, and errors.
===================================================== */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || "Unknown error";

    // 🔒 Handle expired / invalid session
    if (status === 401) {
      console.warn("⚠️ Unauthorized or expired session:", message);
      localStorage.removeItem("rabwah_token");
      localStorage.removeItem("rabwah_user");

      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    // 🚫 Forbidden (role restriction)
    else if (status === 403) {
      alert("🚫 You don’t have permission to perform this action.");
    }

    // ⚙️ Bad request
    else if (status === 400) {
      console.warn("⚠️ Bad Request:", message);
    }

    // 🚨 Server issue
    else if (status >= 500) {
      console.error("🚨 Server Error:", message);
    }

    return Promise.reject(error);
  }
);

/* =====================================================
   🧩 Helper Methods
   Clean syntax when calling API in components
===================================================== */
export const get = (url, config) => api.get(url, config);
export const post = (url, data, config) => api.post(url, data, config);
export const put = (url, data, config) => api.put(url, data, config);
export const del = (url, config) => api.delete(url, config);

export default api;
