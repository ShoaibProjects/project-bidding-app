"use client";

import { useEffect, useState } from "react";
import { getProjectsByBuyerId } from "@/app/services/projectService";
import {
  updateUserProfileInfo,
  updateUserProfileImage,
} from "@/app/services/userService";
import { Project, Role } from "@/app/types";
import { useUserStore } from "@/store/userStore";

type BuyerProfileProps = {
  id: string;
  name: string;
  email: string;
  role: Role;
  description?: string;
  profileImage?: string;
};

export default function BuyerProfile({
  id,
  name,
  email,
  description,
  profileImage,
}: BuyerProfileProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formName, setFormName] = useState(name ?? "");
  const [formDescription, setFormDescription] = useState(description ?? "");
  const [formProfileImage, setFormProfileImage] = useState<File | null>(null);
  const { user, setUser } = useUserStore();

  const isOwnProfile = id === user?.id;

  useEffect(() => {
    const fetchProjects = async () => {
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

  const handleProfileUpdate = async () => {
    try {
      // 1. Update text info
      await updateUserProfileInfo({
        name: formName,
        description: formDescription,
      });

      // 2. If image exists, upload it
      if (formProfileImage) {
        const formData = new FormData();
        formData.append("profileImage", formProfileImage);
        await updateUserProfileImage(formData);
      }

      // 3. Reflect updates in UI
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
      <h2 className="text-2xl font-bold">Buyer Profile</h2>

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
            <p>
              <span className="font-medium">Description:</span>{" "}
              {description || "No description provided."}
            </p>
            {profileImage && (
              <div className="mt-2">
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-32 h-32 object-cover rounded"
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
        <h3 className="text-xl font-semibold mt-6 mb-2">My Projects</h3>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : projects.length === 0 ? (
          <p className="text-gray-500">You haven’t posted any projects yet.</p>
        ) : (
          <ul className="list-disc list-inside space-y-1">
            {projects.map((project) => (
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
