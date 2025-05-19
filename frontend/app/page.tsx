"use client"
// import Head from 'next/head';
// import ProjectForm from './components/ProjectForm';
// import ProjectList from './components/ProjectList';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <h1 className="text-3xl font-bold mb-6">Welcome to Project Bidding</h1>
      <div className="space-x-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => router.push('/auth/signup')}
        >
          Sign Up
        </button>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={() => router.push('/auth/login')}
        >
          Log In
        </button>
      </div>
    </div>
  );
}
