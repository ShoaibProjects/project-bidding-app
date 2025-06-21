// MyProjects.tsx - Main container component
"use client";

import { useEffect, useState } from "react";
import { getProjectsByBuyerId } from "../../services/projectService";
import { Project } from "../../types";
import { useUserStore } from "@/store/userStore";
import { getSortableList } from "../../utils/getSortableList";
import ProjectCard from "./ProjectCard";
import SortSelector from "./SortSelector";
import { Loader2, FolderOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Type definitions for sorting options
 * @typedef {"budget" | "deadline" | "recency" | "status" | "alphabetical"} ProjectSortOption
 * @typedef {"rating" | "budget" | "deadline" | "recency"} BidSortOption
 */
type ProjectSortOption = "budget" | "deadline" | "recency" | "status" | "alphabetical";
type BidSortOption = "rating" | "budget" | "deadline" | "recency";

/**
 * Props interface for MyProjects component
 * @property {boolean} toRefresh - Flag to trigger data refresh
 * @property {React.Dispatch<React.SetStateAction<boolean>>} [setToRefresh] - Optional refresh trigger
 */
interface MyProjectsProps {
  toRefresh: boolean;
  setToRefresh?: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Animation variants for Framer Motion
 * - containerVariants: Controls staggered animation of child elements
 * - itemVariants: Controls animation of individual project cards
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Stagger child animations by 0.1s
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring", // Spring animation for bouncy effect
      stiffness: 100, // Controls spring stiffness
    },
  },
};

/**
 * MyProjects component - Main container for displaying buyer's projects
 * Features:
 * - Fetches and displays projects for the current buyer
 * - Sorting functionality for projects and bids
 * - Responsive layout with animations
 * - Loading and empty states
 * @param {MyProjectsProps} props - Component props
 * @returns {React.ReactElement} The projects dashboard
 */
export default function MyProjects({ toRefresh, setToRefresh }: MyProjectsProps) {
  // State management
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectSortOption, setProjectSortOption] = useState<ProjectSortOption>("recency");
  const [bidSortOption, setBidSortOption] = useState<BidSortOption>("recency");
  const [loading, setLoading] = useState(false);

  const { user } = useUserStore();
  // Get sorted projects based on current sort option
  const sortedProjects = getSortableList(projects, projectSortOption, "project");

  // Fetch projects when user ID changes or refresh is triggered
  useEffect(() => {
    if (user?.id) fetchProjects(user.id);
  }, [user?.id, toRefresh]);

  /**
   * Fetches projects for the current buyer
   * @param {string} buyerId - ID of the current buyer
   */
  const fetchProjects = async (buyerId: string) => {
    try {
      setLoading(true);
      const res = await getProjectsByBuyerId(buyerId);
      setProjects(res.data);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  };

  // Sort options configuration for project sorting dropdown
  const projectSortOptions = {
    budget: "Budget (High → Low)",
    deadline: "Deadline (Soonest First)",
    recency: "Recency (Newest First)",
    status: "Status",
    alphabetical: "Alphabetical (A → Z)",
  };

  return (
    // Main container with entrance animation
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 bg-gray-900 text-white p-4 md:p-6 lg:p-8 rounded-2xl shadow-2xl"
    >
      {/* Header section with title and sort controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
        {/* Animated title with gradient text */}
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent"
        >
          My Projects
        </motion.h2>

        {/* Animated sort selector */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full md:w-auto"
        >
          <SortSelector
            selected={projectSortOption}
            onChange={setProjectSortOption}
            options={projectSortOptions}
            label="Sort projects by"
            className="w-full md:w-72 mr-10"
          />
        </motion.div>
      </div>

      {/* Content area with loading, empty, and project states */}
      <AnimatePresence mode="wait">
        {loading ? (
          // Loading state
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
            <p className="text-lg text-gray-400">Loading your projects...</p>
          </motion.div>
        ) : !projects.length ? (
          // Empty state
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-2xl border border-gray-700 p-6 md:p-12 text-center shadow-lg"
          >
            <FolderOpen className="mx-auto h-16 w-16 text-purple-400" />
            <h3 className="mt-6 text-xl md:text-2xl font-semibold text-white">No Projects Found</h3>
            <p className="mt-3 text-gray-400">
              Start your journey by creating a new project.
            </p>
          </motion.div>
        ) : (
          // Projects list with staggered animations
          <motion.div
            key="projects"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {sortedProjects.map((project) => (
              <motion.div key={project.id} variants={itemVariants}>
                <ProjectCard
                  project={project}
                  bidSortOption={bidSortOption}
                  setBidSortOption={setBidSortOption}
                  setToRefresh={setToRefresh}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}