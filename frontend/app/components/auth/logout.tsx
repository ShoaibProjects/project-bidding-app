'use client';

import { useUserStore } from '@/store/userStore'; 
import { useRouter } from 'next/navigation';

/**
 * LogoutButton component - Provides a button to log the user out.
 * Clears user authentication state and token, then redirects to login page.
 */
export default function LogoutButton() {
  const { clearUser } = useUserStore();
  const router = useRouter();

  /**
   * Handles the logout process:
   * - Clears user data from global store
   * - Removes auth token from localStorage
   * - Redirects user to the login page
   */
  const handleLogout = () => {
    clearUser();                    // Clear user auth state from store
    localStorage.removeItem('token'); // Remove auth token from localStorage
    router.push('/auth/login');     // Navigate to login page
  };

  return (
    <button
      onClick={handleLogout}
      type="button"
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition duration-100 transform hover:scale-[1.02]"
    >
      Logout
    </button>
  );
}
