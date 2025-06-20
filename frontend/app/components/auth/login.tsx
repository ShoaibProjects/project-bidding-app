"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/app/services/authService";
import { LoginData } from "@/app/types";
import { useUserStore } from "@/store/userStore";
import { Eye, EyeOff } from "lucide-react"; // Icon components for password visibility toggle

/**
 * Login component - Renders login form with email and password fields.
 * Handles user authentication and redirects to role-based dashboard on success.
 */
export default function Login() {
  const router = useRouter();
  const { setUser } = useUserStore();

  // State to hold form input values
  const [form, setForm] = useState<LoginData>({
    email: "",
    password: "",
    rememberMe: false,
  });

  // State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Handles form input changes by updating the corresponding field in state.
   * @param e - Change event from input fields
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /**
   * Attempts to log the user in by calling the login service.
   * On success, updates global user state, stores token, and redirects.
   * On failure, logs error and alerts the user.
   */
  const handleLogin = async () => {
    try {
      const res = await login(form);

      setUser({
        email: res.data.user.email,
        id: res.data.user.id,
        role: res.data.user.role,
      });
      localStorage.setItem("token", res.data.token);
      router.push(`/dashboard/${res.data.user.role.toLowerCase()}`);
    } catch (error) {
      console.error("Login error:", error);
      // Replaced alert() with console.error as alert is not supported
      // In a real app, you would show a custom modal or toast notification
      console.error("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 font-inter">
      <div className="bg-gray-800 shadow-xl rounded-2xl p-8 w-full max-w-md transition-all duration-300">
        {/* Header */}
        <h2 className="text-3xl font-semibold text-center mb-6 text-purple-400">
          Welcome Back
        </h2>

        {/* Form inputs */}
        <div className="space-y-4">
          {/* Email input */}
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />

          {/* Password input with toggle visibility button */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-3 text-gray-400 hover:text-purple-300"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Remember Me checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="rememberMe"
              checked={form.rememberMe}
              onChange={(e) =>
                setForm({ ...form, rememberMe: e.target.checked })
              }
              className="mr-2 h-4 w-4 text-purple-600 border-gray-600 rounded focus:ring-purple-500 bg-gray-700"
              id="rememberMe"
            />
            <label htmlFor="rememberMe" className="text-sm text-gray-300">
              Remember Me
            </label>
          </div>

          {/* Login button */}
          <button
            onClick={handleLogin}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition duration-100 transform hover:scale-[1.02] shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            Log In
          </button>
        </div>

        {/* Signup redirect link */}
        <p className="mt-6 text-center text-sm text-gray-400">
          New user?{" "}
          <button
            onClick={() => router.push("/auth/signup")}
            className="text-purple-500 hover:underline transition focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}