"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BuyerProfile from "@/app/components/profiles/buyer-profile/BuyerProfile";
import SellerProfile from "@/app/components/profiles/seller-profile/SellerProfile";
import { Role } from "@/app/types";
import { getUserById } from "@/app/services/userService";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertTriangle } from "lucide-react";

type UserInfo = {
  id: string;
  name: string;
  email: string;
  role: Role;
  rating?: number;
  description?: string;
  profileImage?: string;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delay: 0.2,
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.3,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

export default function Profile() {
  const params = useParams();
  const userId = params?.userid as string;

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await getUserById(userId);
        setUserInfo(res.data);
        console.log(res.data)
      } catch (err: any) {
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
  }, [userId]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {loading ? (
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
          <motion.div
            key="profile"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-5xl"
          >
            {userInfo.role === "BUYER" ? (
              <BuyerProfile {...userInfo} />
            ) : (
              <SellerProfile {...userInfo} />
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}