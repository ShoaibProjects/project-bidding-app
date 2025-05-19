import API from "./api";
import { LoginData, SignupData } from "../types";

// Sign up a new user
export const signup = (data: SignupData) => API.post("/api/auth/signup", data);

// Log in an existing user
export const login = (data: LoginData) => API.post("/api/auth/login", data);

// Optionally, log out a user (if your backend supports it)
export const logout = () => API.post("/api/auth/logout");

// Get current logged-in user info (optional endpoint if session/token based)
export const getCurrentUser = () => API.get("/api/auth/me");
