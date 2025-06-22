"use client";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { googleLogin } from "@/app/services/authService"; // Import the googleLogin function

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
      
      // Use the centralized API service instead of direct fetch
      const response = await googleLogin(idToken);
      const data = response.data;
      
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

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleGoogleLogin}
      className="flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
    >
      <FcGoogle className="w-5 h-5" />
      <span>Login with Google</span>
    </motion.button>
  );
};

export default GoogleLoginButton;