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

type ProjectSortOption = "budget" | "deadline" | "recency" | "status" | "alphabetical";
type BidSortOption = "rating" | "budget" | "deadline" | "recency";

interface MyProjectsProps {
  toRefresh: boolean;
  setToRefresh?: React.Dispatch<React.SetStateAction<boolean>>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

export default function MyProjects({ toRefresh, setToRefresh }: MyProjectsProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectSortOption, setProjectSortOption] = useState<ProjectSortOption>("recency");
  const [bidSortOption, setBidSortOption] = useState<BidSortOption>("recency");
  const [loading, setLoading] = useState(false);

  const { user } = useUserStore();
  const sortedProjects = getSortableList(projects, projectSortOption, "project");

  useEffect(() => {
    if (user?.id) fetchProjects(user.id);
  }, [user?.id, toRefresh]);

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

  const projectSortOptions = {
    budget: "Budget (High → Low)",
    deadline: "Deadline (Soonest First)",
    recency: "Recency (Newest First)",
    status: "Status",
    alphabetical: "Alphabetical (A → Z)",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 bg-gray-900 text-white p-8 rounded-2xl shadow-2xl"
    >
      <div className="flex flex-col md:pr-8 md:flex-row md:items-center md:justify-between gap-6">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent"
        >
          My Projects
        </motion.h2>

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
            className="w-full md:w-72"
          />
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
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
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-2xl border border-gray-700 p-12 text-center shadow-lg"
          >
            <FolderOpen className="mx-auto h-16 w-16 text-purple-400" />
            <h3 className="mt-6 text-2xl font-semibold text-white">No Projects Found</h3>
            <p className="mt-3 text-gray-400">
              Start your journey by creating a new project.
            </p>
          </motion.div>
        ) : (
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