'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/app/services/authService';
import { LoginData } from '@/app/types';
import { useUserStore } from '@/store/userStore';


export default function Login() {
  const router = useRouter();
  const { setUser } = useUserStore();

  const [form, setForm] = useState<LoginData>({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const res = await login(form); // only sends { email, password }
      console.log(res)
      setUser({
        email: res.data.user.email,
        id: res.data.user.id,
        role: res.data.user.role
      })
      // After successful login:
localStorage.setItem("token", res.data.token);

      router.push(`/dashboard/${res.data.user.role.toLowerCase()}`);
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl mb-4 font-bold">Log In</h2>

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
{/* 
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as 'BUYER' | 'SELLER')}
        className="block w-full mb-4 p-2 border border-gray-300 rounded"
      >
        <option value="BUYER">Buyer</option>
        <option value="SELLER">Seller</option>
      </select> */}

      <button
        onClick={handleLogin}
        className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
      >
        Log In
      </button>
      <p>New user?</p>
      <button onClick={()=>{router.push(`/auth/signup`)}}>signup</button>
    </div>
  );
}
