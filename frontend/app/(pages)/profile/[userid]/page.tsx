"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BuyerProfile from "@/app/components/profiles/buyer-profile/BuyerProfile";
import SellerProfile from "@/app/components/profiles/seller-profile/SellerProfile";
import { Role } from "@/app/types";
import { getUserById } from "@/app/services/userService";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertTriangle } from "lucide-react";

// Type definition for user information
type UserInfo = {
  id: string;
  name: string;
  email: string;
  role: Role;
  rating?: number;
  description?: string; 
  profileImage?: string; 
};

// Animation variants for the container
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delay: 0.2,
      duration: 0.5,
      when: "beforeChildren", // Animate container before children
      staggerChildren: 0.3, // Stagger animation of children
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
    },
  },
};

// Animation variants for individual items
const itemVariants = {
  hidden: { y: 20, opacity: 0 }, // Start slightly below and invisible
  visible: {
    y: 0, // Move to normal position
    opacity: 1, // Fade in
    transition: {
      duration: 0.5,
    },
  },
};

/**
 * Profile page component that displays either a buyer or seller profile
 * based on the user ID in the URL parameters.
 */
export default function Profile() {
  // Get user ID from URL parameters
  const params = useParams();
  const userId = params?.userid as string;

  // State management
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toRefresh, setToRefresh] = useState<boolean>(false); // Used to trigger refresh

  // Fetch user data when userId changes or refresh is triggered
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await getUserById(userId);
        setUserInfo(res.data);
        console.log(res.data);
      } catch (err: unknown) {
        console.error("Failed to fetch user", err);
        setError("Could not find the requested user.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    } else {
      setError("User ID is missing.");
      setLoading(false);
    }
  }, [userId, toRefresh]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      {/* Animation wrapper for smooth transitions between states */}
      <AnimatePresence mode="wait">
        {loading ? (
          // Loading state with spinner animation
          <motion.div
            key="loader"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col items-center justify-center gap-4 text-gray-400"
          >
            <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
            <motion.p variants={itemVariants} className="text-lg">
              Loading Profile...
            </motion.p>
          </motion.div>
        ) : error ? (
          // Error state display
          <motion.div
            key="error"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col items-center justify-center gap-4 text-red-500 bg-gray-800 p-8 rounded-2xl shadow-lg"
          >
            <AlertTriangle className="w-12 h-12" />
            <motion.p variants={itemVariants} className="text-xl font-semibold">
              {error}
            </motion.p>
          </motion.div>
        ) : userInfo ? (
          // Success state - display appropriate profile based on user role
          <motion.div
            key="profile"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-5xl"
          >
            {userInfo.role === "BUYER" ? (
              <BuyerProfile {...userInfo} setToRefresh={setToRefresh} />
            ) : (
              <SellerProfile {...userInfo} setToRefresh={setToRefresh} />
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}