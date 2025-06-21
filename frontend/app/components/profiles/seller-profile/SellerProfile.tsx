"use client";

import { useEffect, useState } from "react";
import {
  updateUserProfileInfo,
  updateUserProfileImage,
} from "@/app/services/userService";
import { getSelectedProjectsForSeller } from "@/app/services/projectService";
import { Project, Role } from "@/app/types";
import { useUserStore } from "@/store/userStore";
import { motion, AnimatePresence } from "framer-motion";
import { Star, PencilIcon } from "lucide-react";

/**
 * Props interface for SellerProfile component
 * @property {string} id - Seller's unique identifier
 * @property {string} name - Seller's display name
 * @property {string} email - Seller's email address
 * @property {Role} role - Seller's role (BUYER/SELLER)
 * @property {number} [rating] - Optional average rating
 * @property {string} [description] - Optional profile description
 * @property {string} [profileImage] - Optional profile image URL
 * @property {React.Dispatch<React.SetStateAction<boolean>>} [setToRefresh] - Optional refresh trigger
 */
type SellerProfileProps = {
  id: string;
  name: string;
  email: string;
  role: Role;
  rating?: number;
  description?: string;
  profileImage?: string;
  setToRefresh?: React.Dispatch<React.SetStateAction<boolean>>;
};

/**
 * SellerProfile component displays and manages seller profile information
 * Features:
 * - View and edit profile details
 * - Profile image upload
 * - Display of assigned projects
 * - Rating display
 * - Responsive design with animations
 */
export default function SellerProfile({
  id,
  name,
  email,
  rating,
  description,
  profileImage,
  setToRefresh
}: SellerProfileProps) {
  // State management
  const [assignedProjects, setAssignedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formName, setFormName] = useState(name ?? "");
  const [formDescription, setFormDescription] = useState(description ?? "");
  const [formProfileImage, setFormProfileImage] = useState<File | null>(null);
  const { user, setUser } = useUserStore();

  // Check if current user is viewing their own profile
  const isOwnProfile = id === user?.id;

  // Fetch seller's assigned projects on component mount
  useEffect(() => {
    const fetchAssignedProjects = async () => {
      try {
        const res = await getSelectedProjectsForSeller(id);
        setAssignedProjects(res.data);
      } catch (err) {
        console.error("Failed to fetch assigned projects", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignedProjects();
  }, [id]);

  /**
   * Handles profile updates including text info and image
   */
  const handleProfileUpdate = async () => {
    try {
      // Update text fields
      await updateUserProfileInfo({
        name: formName,
        description: formDescription,
      });
      
      // Update image if provided
      if (formProfileImage) {
        const formData = new FormData();
        formData.append("profileImage", formProfileImage);
        await updateUserProfileImage(formData);
      }
      
      // Update global user state
      setUser({
        ...user!,
        name: formName,
        description: formDescription,
      });
      
      // Reset edit mode and trigger refresh if needed
      setEditMode(false);
      setToRefresh?.((prev) => !prev);
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Update failed");
    }
  };

  return (
    // Main container with entrance animation
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto mt-12 p-8 bg-gray-900 text-white rounded-2xl shadow-2xl border border-gray-700 space-y-10"
    >
      {/* Header section with title and edit button */}
      <div className="flex justify-between items-start">
        {/* Animated gradient title */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent"
        >
          Seller Profile
        </motion.h2>
        
        {/* Edit button (only visible on own profile) */}
        {isOwnProfile && !editMode && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setEditMode(true)}
            className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <PencilIcon className="w-5 h-5" />
            Edit Profile
          </motion.button>
        )}
      </div>

      {/* Profile section with edit/view toggle */}
      <AnimatePresence mode="wait">
        {editMode ? (
          // --- EDIT MODE ---
          <motion.div
            key="edit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Name input field */}
            <div>
              <label className="block font-semibold text-gray-400 mb-2">Name</label>
              <input
                className="w-full bg-gray-800 border border-gray-700 px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            
            {/* Description textarea */}
            <div>
              <label className="block font-semibold text-gray-400 mb-2">Description</label>
              <textarea
                className="w-full bg-gray-800 border border-gray-700 px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>
            
            {/* Profile image upload */}
            <div>
              <label className="block font-semibold text-gray-400 mb-2">Profile Image</label>
              <input
                type="file"
                accept="image/*"
                className="w-full bg-gray-800 border border-gray-700 px-4 py-3 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                onChange={(e) => setFormProfileImage(e.target.files?.[0] ?? null)}
              />
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleProfileUpdate}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Changes
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditMode(false)}
                className="bg-gray-700 text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        ) : (
          // --- VIEW MODE ---
          <motion.div
            key="view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Profile display */}
            <div className="flex flex-col md:flex-row md:items-center gap-8">
              {/* Profile image with hover effect */}
              {profileImage && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex-shrink-0"
                >
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-36 h-36 object-cover rounded-full border-4 border-purple-500 shadow-lg"
                  />
                </motion.div>
              )}
              
              {/* Profile details */}
              <div className="space-y-4">
                <p className="text-2xl font-bold">{name || "N/A"}</p>
                <p className="text-gray-400">{email || "N/A"}</p>
                
                {/* Rating display */}
                {rating !== null && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-300">Average Rating:</span>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-5 h-5" />
                      <span>{rating?.toFixed(1)}</span>
                    </div>
                  </div>
                )}
                
                <p className="text-gray-300 max-w-lg">
                  {description || "No description provided."}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assigned projects section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-12"
      >
        <h3 className="text-3xl font-semibold mb-6 text-gray-200">
          Assigned Projects
        </h3>
        
        {/* Loading/empty state handling */}
        {loading ? (
          <motion.div className="text-gray-500">
            Loading assigned projects...
          </motion.div>
        ) : assignedProjects.length === 0 ? (
          <motion.div className="text-center py-10 px-6 bg-gray-800 rounded-lg">
            <p className="text-gray-400">No projects have been assigned yet.</p>
          </motion.div>
        ) : (
          // Projects list with animations
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            className="space-y-4"
          >
            {assignedProjects.map((project) => (
              <motion.li
                key={project.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{
                  backgroundColor: "rgba(139, 92, 246, 0.1)",
                  borderColor: "rgba(139, 92, 246, 0.5)",
                }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex items-center justify-between bg-gray-800 rounded-lg p-5 shadow-md border border-gray-700"
              >
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="font-semibold text-lg text-gray-100">
                    {project.title}
                  </span>
                </div>
                <span className="text-purple-400 font-bold text-lg">
                  ${project.budget}
                </span>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </motion.div>
    </motion.div>
  );
}