import axios from "axios";

/**
 * Axios instance configured for API calls
 * --------------------------------------
 * - baseURL is set from environment variable NEXT_PUBLIC_API_BASE_URL
 * - Automatically attaches Bearer token from localStorage to request headers if available
 * - Redirects to home on 401 Unauthorized (session expired) or 403 Forbidden
 */

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// Request interceptor to add Authorization header with Bearer token
API.interceptors.request.use(
  (config) => {
    // Check if running in browser (window is defined)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token"); // Retrieve token from localStorage
      if (token) {
        // Add Authorization header if token exists
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config; // Return the modified config
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 and 403 errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403) &&
      typeof window !== "undefined"
    ) {

      alert("Your session expired! Rediecting to Home Page")
      // Clear token from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user-storage");

      // Redirect to base page
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default API;
