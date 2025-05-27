"use client"; // Client-side React component in Next.js app directory

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useUserStore } from "@/store/userStore";

/**
 * Home component - Landing page for the Project Bidding app.
 * Displays a welcoming UI with animated heading and buttons for Sign Up and Log In.
 */
export default function Home() {
  const router = useRouter();
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on role
      if (user.role === "BUYER") {
        router.replace("/dashboard/buyer");
      } else if (user.role === "SELLER") {
        router.replace("/dashboard/seller");
      } else {
        // default fallback redirect if role unknown
        router.replace("/");
      }
    }
  }, [isAuthenticated, user, router]);

  if (isAuthenticated) {
    // Optional: render null or loading spinner while redirecting
    return null;
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-tr from-[#F9FAFB] via-[#FDF7F7] to-[#F4F5FF] flex items-center justify-center px-4"
      style={{ fontFamily: '"Outfit", sans-serif' }} // Apply custom font
    >
      {/* Animated container for content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white border border-gray-100 shadow-2xl rounded-3xl px-10 py-12 w-full md:max-w-lg text-center"
      >
        {/* Animated heading */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-4xl font-bold text-gray-800 mb-4"
        >
          🚀 Project Bidding
        </motion.h1>

        {/* Subheading text */}
        <p className="text-gray-500 text-base mb-10">
          Match with the perfect buyer or seller and get projects done —
          beautifully.
        </p>

        {/* Buttons for navigation with animation on hover and tap */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/auth/signup")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-medium shadow-md transition-all duration-300"
          >
            Sign Up
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/auth/login")}
            className="bg-white border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 shadow-sm"
          >
            Log In
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
