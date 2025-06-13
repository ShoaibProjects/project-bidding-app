"use client"; // Client-side React component in Next.js app directory

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUserStore } from "@/store/userStore";
import ProjectList from "./components/ProjectList";

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
    <>
     <button  onClick={() => router.push("/auth")}>Signup/Login</button>
     <ProjectList toRefresh/>
    </>
  );
}
