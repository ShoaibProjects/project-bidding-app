'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/app/services/authService';
import { LoginData } from '@/app/types';
import { useUserStore } from '@/store/userStore';
import { Eye, EyeOff } from 'lucide-react'; // Icon components for password visibility toggle

/**
 * Login component - Renders login form with email and password fields.
 * Handles user authentication and redirects to role-based dashboard on success.
 */
export default function Login() {
  const router = useRouter();
  const { setUser } = useUserStore();

  // State to hold form input values
  const [form, setForm] = useState<LoginData>({
    email: '',
    password: '',
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
      localStorage.setItem('token', res.data.token);
      router.push(`/dashboard/${res.data.user.role.toLowerCase()}`);
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md transition-all duration-300 font-outfit">
        {/* Header */}
        <h2 className="text-3xl font-semibold text-center mb-6 text-gray-800">Welcome Back</h2>

        {/* Form inputs */}
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

          {/* Password input with toggle visibility button */}
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

          {/* Login button */}
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition duration-100 transform hover:scale-[1.02]"
          >
            Log In
          </button>
        </div>

        {/* Signup redirect link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          New user?{' '}
          <button
            onClick={() => router.push('/auth/signup')}
            className="text-blue-600 hover:underline transition"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
