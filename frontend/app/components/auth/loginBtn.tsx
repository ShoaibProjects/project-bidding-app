"use client";

import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";

const GoogleLoginButton = () => {
  const router = useRouter();
  const { setUser } = useUserStore();

  const handleGoogleLogin = async () => {
    try {
          // 👇 Lazy import only in browser
      const { auth, provider, signInWithPopup } = await import("../../utils/firebase");
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Get ID token from Firebase user
      const idToken = await firebaseUser.getIdToken();

      // Send the token to backend
      const res = await fetch("http://localhost:3001/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        throw new Error("Failed to log in via backend");
      }

      const data = await res.json();

      // Set user and store token
      setUser({
        email: data.user.email,
        id: data.user.id,
        role: data.user.role,
        name: data.user.name, // if needed
      });

      localStorage.setItem("token", data.token);

      // Redirect to appropriate dashboard
      router.push(`/dashboard/${data.user.role.toLowerCase()}`);
    } catch (err) {
      console.error("Google login failed:", err);
      alert("Login failed. Please try again.");
    }
  };

  return <button onClick={handleGoogleLogin}>Login with Google 2</button>;
};

export default GoogleLoginButton;
