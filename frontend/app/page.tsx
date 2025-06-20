"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUserStore } from "@/store/userStore";
import ProjectList from "./components/ProjectList";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Loader2 } from "lucide-react";

export default function Home() {
    const router = useRouter();
    const isAuthenticated = useUserStore((state) => state.isAuthenticated);
    const user = useUserStore((state) => state.user);

    useEffect(() => {
        // This core logic remains completely unchanged.
        if (isAuthenticated && user) {
            if (user.role === "BUYER") {
                router.replace("/dashboard/buyer");
            } else if (user.role === "SELLER") {
                router.replace("/dashboard/seller");
            } else {
                // Fallback, though unlikely with defined roles
                router.replace("/");
            }
        }
    }, [isAuthenticated, user, router]);

    // Enhanced Loading/Redirecting State
    if (isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-purple-400" />
                <p className="text-gray-400 text-lg">Connecting to your dashboard...</p>
            </div>
        );
    }

    // Main Homepage UI for unauthenticated users
    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans overflow-x-hidden">
            {/* Header */}
            <header className="absolute top-0 left-0 right-0 p-6 z-10">
                <nav className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                        Project Bidding
                    </h1>
                    <motion.button
                        onClick={() => router.push("/auth")}
                        className="px-4 py-2 text-sm font-medium rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Sign In
                    </motion.button>
                </nav>
            </header>
            
            {/* Hero Section */}
            <main className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-24 pb-12">
                {/* Background Glow Effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-96 h-96 bg-purple-600 rounded-full filter blur-3xl opacity-20 animate-blob"></div>
                    <div className="w-80 h-80 bg-pink-600 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="relative z-10 max-w-4xl w-full"
                >
                    <h2 className="text-5xl md:text-7xl font-bold tracking-tighter bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent mb-6">
                        Where Great Ideas Meet Great Talent
                    </h2>
                    <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10">
                        The ultimate platform for buyers to post projects and sellers to find their next challenge. Seamless, efficient, and built for success.
                    </p>
                    <motion.button
                        onClick={() => router.push("/auth")}
                        className="flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-full font-semibold shadow-lg transition-all transform hover:scale-105 mx-auto"
                        whileHover={{ scale: 1.05, boxShadow: '0px 0px 20px rgba(236, 72, 153, 0.5)' }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Zap className="w-6 h-6" />
                        <span>Get Started Now</span>
                        <ArrowRight className="w-5 h-5" />
                    </motion.button>
                </motion.div>
            </main>

            {/* Latest Projects Section */}
            <section className="relative bg-gray-900 py-20 px-4">
                 <div className="absolute inset-0 bg-grid-white/[0.05] [mask-image:linear-gradient(to_bottom,white_10%,transparent_90%)]"></div>
                <div className="max-w-6xl mx-auto relative">
                    <h3 className="text-3xl font-bold text-center mb-10">
                        Explore Live Projects
                    </h3>
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                        <ProjectList toRefresh />
                    </div>
                </div>
            </section>
        </div>
    );
}