import axios from "axios";

/**
 * Axios instance configured for API calls
 * --------------------------------------
 * - baseURL is set from environment variable NEXT_PUBLIC_API_BASE_URL
 * - Automatically attaches Bearer token from localStorage to request headers if available
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

export default API;
