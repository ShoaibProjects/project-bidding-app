"use client";

import { useEffect, useState } from "react";
import {
  updateUserProfileInfo,
  updateUserProfileImage,
} from "@/app/services/userService";
import { getSelectedProjectsForSeller } from "@/app/services/projectService";
import { Project, Role } from "@/app/types";
import { useUserStore } from "@/store/userStore";

type SellerProfileProps = {
  id: string;
  name: string;
  email: string;
  role: Role;
  rating?: number;
  description?: string;
  profileImage?: string;
};

export default function SellerProfile({
  id,
  name,
  email,
  rating,
  description,
  profileImage,
}: SellerProfileProps) {
  const [assignedProjects, setAssignedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formName, setFormName] = useState(name ?? "");
  const [formDescription, setFormDescription] = useState(description ?? "");
  const [formProfileImage, setFormProfileImage] = useState<File | null>(null);
  const { user, setUser } = useUserStore();

  const isOwnProfile = id === user?.id;

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

  const handleProfileUpdate = async () => {
    try {
      await updateUserProfileInfo({
        name: formName,
        description: formDescription,
      });

      if (formProfileImage) {
        const formData = new FormData();
        formData.append("profileImage", formProfileImage);
        await updateUserProfileImage(formData);
      }

      setUser({
        ...user!,
        name: formName,
        description: formDescription,
      });

      setEditMode(false);
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Update failed");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded shadow space-y-6">
      <h2 className="text-2xl font-bold">Seller Profile</h2>

      {editMode ? (
        <div className="space-y-4">
          <div>
            <label className="block font-medium">Name</label>
            <input
              className="w-full border px-3 py-2 rounded"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-medium">Description</label>
            <textarea
              className="w-full border px-3 py-2 rounded"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-medium">Profile Image</label>
            <input
              type="file"
              accept="image/*"
              className="w-full border px-3 py-2 rounded"
              onChange={(e) =>
                setFormProfileImage(e.target.files?.[0] ?? null)
              }
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleProfileUpdate}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Save
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Name:</span> {name || "N/A"}
            </p>
            <p>
              <span className="font-medium">Email:</span> {email || "N/A"}
            </p>
            {rating !== undefined && (
              <p>
                <span className="font-medium">Average Rating:</span>{" "}
                {rating.toFixed(1)}
              </p>
            )}
            <p>
              <span className="font-medium">Description:</span>{" "}
              {description || "No description provided."}
            </p>
            {profileImage && (
              <div className="mt-4 flex justify-center">
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-2 border-gray-300 shadow-md"
                />
              </div>
            )}
          </div>
          {isOwnProfile && (
            <button
              onClick={() => setEditMode(true)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Edit Profile
            </button>
          )}
        </>
      )}

      <div>
        <h3 className="text-xl font-semibold mt-6 mb-2">Assigned Projects</h3>
        {loading ? (
          <p className="text-gray-500">Loading assigned projects...</p>
        ) : assignedProjects.length === 0 ? (
          <p className="text-gray-500">
            No projects have been assigned to you yet.
          </p>
        ) : (
          <ul className="list-disc list-inside space-y-1">
            {assignedProjects.map((project) => (
              <li key={project.id}>
                <span className="font-medium">{project.title}</span> — $
                {project.budget}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
