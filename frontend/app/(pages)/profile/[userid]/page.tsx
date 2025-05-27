"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BuyerProfile from "@/app/components/profiles/buyer-profile/BuyerProfile";
import SellerProfile from "@/app/components/profiles/seller-profile/SellerProfile";
import { Role } from "@/app/types";
import { getUserById } from "@/app/services/userService"; 

type UserInfo = {
  id: string;
  name: string;
  email: string;
  role: Role;
  rating?: number;
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
        const res = await getUserById(userId);
        setUserInfo(res.data);
      } catch (err: any) {
        console.error("Failed to fetch user", err);
        setError("User not found.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  if (loading) return <p className="p-4 text-gray-500">Loading profile...</p>;
  if (error || !userInfo) return <p className="p-4 text-red-500">{error || "User not found."}</p>;

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4">
      {userInfo.role === "BUYER" ? (
        <BuyerProfile {...userInfo} />
      ) : (
        <SellerProfile {...userInfo} />
      )}
    </div>
  );
}
