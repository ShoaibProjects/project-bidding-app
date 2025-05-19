'use client';

import { useUserStore } from '@/store/userStore'; // Adjust path as needed
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const { clearUser } = useUserStore();
  const router = useRouter();

  const handleLogout = () => {
    clearUser();          // Clear user auth state
    localStorage.removeItem("token");
    router.push('/auth/login');  // Redirect to login page
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
      type="button"
    >
      Logout
    </button>
  );
}
