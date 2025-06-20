"use client"; // Client-side React component in Next.js app directory

import { motion } from "framer-motion";
import GoogleLoginButton from "@/app/components/auth/loginBtn";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center px-4"
      style={{ fontFamily: '"Outfit", sans-serif' }} // Apply custom font
    >
      {/* Animated container for content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-gray-800 border border-gray-700 shadow-xl rounded-3xl px-10 py-12 w-full md:max-w-lg text-center"
      >
        {/* Animated heading */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-4xl font-bold text-purple-400 mb-4"
        >
          🚀 Project Bidding
        </motion.h1>

        {/* Subheading text */}
        <p className="text-gray-300 text-base mb-10">
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
          <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mt-16"
      >
        <GoogleLoginButton/>
      </motion.div>
    </div>
  );
}
