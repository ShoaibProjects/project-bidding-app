"use client";

import { useEffect, useState } from "react";
import { getProjectsByBuyerId } from "@/app/services/projectService";
import {
  updateUserProfileInfo,
  updateUserProfileImage,
} from "@/app/services/userService";
import { Project, Role } from "@/app/types";
import { useUserStore } from "@/store/userStore";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Mail,
  Edit,
  Camera,
  Save,
  X,
  Briefcase,
  CircleDollarSign,
  Loader2,
} from "lucide-react";

/**
 * Props interface for BuyerProfile component
 * @property {string} id - User ID
 * @property {string} name - User's name
 * @property {string} email - User's email
 * @property {Role} role - User's role
 * @property {string} [description] - Optional user description
 * @property {string} [profileImage] - Optional profile image URL
 * @property {React.Dispatch<React.SetStateAction<boolean>>} [setToRefresh] - Optional refresh trigger
 */
type BuyerProfileProps = {
  id: string;
  name?: string;
  email: string;
  role: Role;
  description?: string;
  profileImage?: string;
  setToRefresh?: React.Dispatch<React.SetStateAction<boolean>>;
};

/**
 * BuyerProfile component - Displays and manages buyer profile information
 * Features:
 * - View and edit profile details
 * - Profile image upload
 * - Project listing
 * - Responsive design with animations
 * @param {BuyerProfileProps} props - Component props
 * @returns {React.ReactElement} The buyer profile page
 */
export default function BuyerProfile({
  id,
  name,
  email,
  description,
  profileImage,
  setToRefresh,
}: BuyerProfileProps) {
  // State management
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formName, setFormName] = useState(name ?? "");
  const [formDescription, setFormDescription] = useState(description ?? "");
  const [formProfileImage, setFormProfileImage] = useState<File | null>(null);
  const { user, setUser } = useUserStore();

  // Check if this is the current user's own profile
  const isOwnProfile = id === user?.id;

  // Fetch projects when component mounts or ID changes
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const res = await getProjectsByBuyerId(id);
        setProjects(res.data);
      } catch (err) {
        console.error("Failed to fetch projects", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [id]);

  /**
   * Handles profile updates including text info and image
   */
  const handleProfileUpdate = async () => {
    try {
      // Update text info
      const updatedUserInfo = await updateUserProfileInfo({
        name: formName,
        description: formDescription,
      });

      // Update image if a new one is selected
      let updatedImageUser = null;
      if (formProfileImage) {
        const formData = new FormData();
        formData.append("profileImage", formProfileImage);
        updatedImageUser = await updateUserProfileImage(formData);
      }
      
      // Update the global user state with the latest data
      setUser({
        ...user!,
        name: updatedUserInfo.data.name,
        description: updatedUserInfo.data.description,
        profileImage: updatedImageUser?.data.profileImage ?? user?.profileImage,
      });
      
      setEditMode(false);
      setToRefresh?.((prev) => !prev);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Update failed");
    }
  };

  // Animation variants for page transitions
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  return (
    // Main page container with dark theme
    <div className="bg-slate-900 min-h-screen text-slate-300 font-sans p-4 sm:p-6 lg:p-8">
      {/* Animated content container */}
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="in"
        exit="out"
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl shadow-slate-900/50 p-6 sm:p-8 space-y-8"
      >
        {/* Page header with gradient text */}
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-teal-400 to-teal-200 bg-clip-text text-transparent pb-2">
          Buyer Profile
        </h1>

        {/* Profile section with edit/view toggle */}
        <AnimatePresence mode="wait">
          {editMode ? (
            // --- EDIT MODE ---
            <motion.div
              key="edit"
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
                <input
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                <textarea
                  rows={4}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>
              {/* Profile Image Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Profile Image</label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-2 px-4 rounded-lg transition-colors">
                    <Camera className="w-4 h-4"/>
                    <span>Choose File</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setFormProfileImage(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  {formProfileImage && <span className="text-sm text-slate-400">{formProfileImage.name}</span>}
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={handleProfileUpdate}
                  className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold py-2 px-5 rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4"/> Save
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setEditMode(false)}
                  className="flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-5 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4"/> Cancel
                </motion.button>
              </div>
            </motion.div>
          ) : (
            // --- VIEW MODE ---
            <motion.div
              key="view"
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Profile Display */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {profileImage && (
                  <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }} className="flex-shrink-0">
                    <Image
                      src={profileImage}
                      alt="Profile"
                      className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-full ring-4 ring-offset-4 ring-offset-slate-800 ring-teal-500 shadow-lg"
                    />
                  </motion.div>
                )}
                <div className="text-center sm:text-left space-y-4 flex-1">
                  <h2 className="text-3xl font-bold text-slate-100">{name || "Unnamed User"}</h2>
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-400">
                     <Mail className="w-4 h-4 text-teal-500"/> 
                     <span>{email || "No email provided."}</span>
                  </div>
                  <p className="text-slate-300 max-w-xl">
                    {description || "No description available."}
                  </p>
                </div>
              </div>
              {/* Edit Button (only shown on own profile) */}
              {isOwnProfile && (
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-5 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4"/> Edit Profile
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- PROJECTS SECTION --- */}
        <div className="border-t border-slate-700 pt-8">
          <h3 className="text-2xl font-semibold mb-4 text-slate-200 flex items-center gap-3">
            <Briefcase className="text-teal-400"/> My Projects
          </h3>
          {loading ? (
            <div className="flex items-center gap-2 text-slate-500"><Loader2 className="animate-spin w-5 h-5"/>Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="text-slate-500 bg-slate-800/70 p-4 rounded-lg">You haven&apos;t posted any projects yet.</div>
          ) : (
            <motion.ul
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.3 }}
              className="space-y-4"
            >
              {projects.map((project, index) => (
                <motion.li
                  key={project.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, type: "spring", stiffness: 200, damping: 20 }}
                  className="flex items-center justify-between gap-4 bg-slate-800 hover:bg-slate-700/50 p-4 rounded-xl border border-slate-700 transition-colors"
                >
                  <div className="font-semibold text-slate-200">{project.title}</div>
                  <div className="flex items-center gap-2 text-teal-400 font-bold text-sm bg-teal-500/10 px-3 py-1 rounded-full">
                    <CircleDollarSign className="w-4 h-4"/> 
                    <span>${project.budget.toLocaleString()}</span>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </div>
      </motion.div>
    </div>
  );
}