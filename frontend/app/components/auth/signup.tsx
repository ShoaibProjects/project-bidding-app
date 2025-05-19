"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signup } from '@/app/services/authService';
import { SignupData } from '@/app/types';
import { useUserStore } from '@/store/userStore';

export default function Signup() {
  const router = useRouter();
  const { setUser } = useUserStore();

  const [form, setForm] = useState<SignupData>({
    email: '',
    password: '',
    role: 'BUYER',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    try {
      const res = await signup(form);
       setUser({
        email: form.email,
        id: res.data.id,
        role: form.role
      })
      localStorage.setItem("token", res.data.token);
      router.push(`/dashboard/${form.role.toLowerCase()}`);
    } catch (error) {
      console.error("Signup error:", error);
      alert("Signup failed. Please try again.");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl mb-4 font-bold">Sign Up</h2>

      <input
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
        className="block w-full mb-4 p-2 border border-gray-300 rounded"
      />

      <input
        type="password"
        name="password"
        value={form.password}
        onChange={handleChange}
        placeholder="Password"
        className="block w-full mb-4 p-2 border border-gray-300 rounded"
      />

      <select
        name="role"
        value={form.role}
        onChange={handleChange}
        className="block w-full mb-4 p-2 border border-gray-300 rounded"
      >
        <option value="BUYER">Buyer</option>
        <option value="SELLER">Seller</option>
      </select>

      <button
        onClick={handleSignup}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
      >
        Sign Up
      </button>
    </div>
  );
}
