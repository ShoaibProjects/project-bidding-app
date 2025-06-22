import API from "./api";
import { LoginData, SignupData } from "../types";

/**
 * Authentication API service functions
 * ------------------------------------
 * These functions wrap Axios calls to backend authentication endpoints,
 * making it easier to call them from components or other services.
 */

/**
 * Sign up a new user
 * @param data - User signup data including email, password, etc.
 * @returns Axios Promise for POST /api/auth/signup
 */
export const signup = (data: SignupData) => API.post("/api/auth/signup", data);

/**
 * Log in an existing user
 * @param data - User login credentials (email, password)
 * @returns Axios Promise for POST /api/auth/login
 */
export const login = (data: LoginData) => API.post("/api/auth/login", data);

/**
 * Log in with Google using Firebase ID token
 * @param idToken - Firebase ID token from Google authentication
 * @returns Axios Promise for POST /api/auth/google
 */
export const googleLogin = (idToken: string) => 
  API.post("/api/auth/google", { idToken });

/**
 * Log out the current user
 * @returns Axios Promise for POST /api/auth/logout
 */
export const logout = () => API.post("/api/auth/logout");

/**
 * Get info of the currently logged-in user
 * @returns Axios Promise for GET /api/auth/me
 */
export const getCurrentUser = () => API.get("/api/auth/me");