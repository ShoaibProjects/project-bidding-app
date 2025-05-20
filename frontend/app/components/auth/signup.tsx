'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signup } from '@/app/services/authService';
import { SignupData } from '@/app/types';
import { useUserStore } from '@/store/userStore';
import { Eye, EyeOff } from 'lucide-react';

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
    email: '',
    password: '',
    role: 'BUYER', // default role
  });

  // State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Handles input changes for both text inputs and select dropdown.
   * Updates the corresponding field in the form state.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      localStorage.setItem('token', res.data.token);
      router.push(`/dashboard/${form.role.toLowerCase()}`);
    } catch (error) {
      console.error('Signup error:', error);
      alert('Signup failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md transition-all duration-300 font-outfit">
        {/* Heading */}
        <h2 className="text-3xl font-semibold text-center mb-6 text-gray-800">
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
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />

          {/* Password input with visibility toggle */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Role selection dropdown */}
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          >
            <option value="BUYER">Buyer</option>
            <option value="SELLER">Seller</option>
          </select>

          {/* Signup submit button */}
          <button
            onClick={handleSignup}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition duration-100 transform hover:scale-[1.02]"
          >
            Sign Up
          </button>
        </div>

        {/* Link to login page for existing users */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button
            onClick={() => router.push('/auth/login')}
            className="text-blue-600 hover:underline transition"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}
