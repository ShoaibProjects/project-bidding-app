"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Original import
import { signup } from "@/app/services/authService"; // Original import
import { SignupData } from "@/app/types"; // Original import
import { useUserStore } from "@/store/userStore"; // Original import
import { Eye, EyeOff, ShoppingCart, Hammer } from "lucide-react";

/**
 * Signup component allows users to create an account.
 * Handles form input, password visibility toggle, role selection,
 * and submits signup data to the backend.
 */
export default function Signup() {
  const router = useRouter();
  const { setUser } = useUserStore();

  // State to hold form data including email, password, and role (buyer or seller)
  const [form, setForm] = useState<SignupData>({
    email: "",
    password: "",
    role: "BUYER", // default role
    rememberMe: false,
  });

  // State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Handles input changes for both text inputs and select dropdown.
   * Updates the corresponding field in the form state.
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /**
   * Handles the signup process by sending form data to the API.
   * On success, updates global user state, stores auth token,
   * and redirects user to the appropriate dashboard based on role.
   * Shows an alert on failure.
   */
  const handleSignup = async () => {
    try {
      const res = await signup(form);
      setUser({
        email: res.data.user.email,
        id: res.data.user.id,
        role: res.data.user.role,
      });
      localStorage.setItem("token", res.data.token);
      router.push(`/dashboard/${form.role.toLowerCase()}`);
    } catch (error) {
      console.error("Signup error:", error);
      // alert("Signup failed. Please try again."); // Removed alert(), consider custom modal/toast in your actual app
      console.error("Signup failed. Please try again."); // Using console.error for this environment
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 font-inter">
      <div className="bg-gray-800 shadow-xl rounded-2xl p-8 w-full max-w-md transition-all duration-300">
        {/* Heading */}
        <h2 className="text-3xl font-semibold text-center mb-6 text-purple-400">
          Create Your Account
        </h2>

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

          {/* Password input with visibility toggle */}
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
          
          <div className="relative">
          {/* Role selection dropdown */}
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition appearance-none"
          >
            <option value="BUYER" className="bg-gray-700 text-gray-100">Buyer</option>
            <option value="SELLER" className="bg-gray-700 text-gray-100">Seller</option>
          </select>
            <span className="absolute right-3 top-3 text-gray-400">
    {form.role === "BUYER" ? <ShoppingCart size={20} /> : <Hammer size={20} />}
  </span>
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

          {/* Signup submit button */}
          <button
            onClick={handleSignup}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition duration-100 transform hover:scale-[1.02] shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            Sign Up
          </button>
        </div>

        {/* Link to login page for existing users */}
        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <button
            onClick={() => router.push("/auth/login")}
            className="text-purple-500 hover:underline transition focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}