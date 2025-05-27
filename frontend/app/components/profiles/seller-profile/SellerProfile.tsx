"use client";

import { useEffect, useState } from "react";
import { getSelectedProjectsForSeller } from "@/app/services/projectService";
import { Project, Role } from "@/app/types";

type SellerProfileProps = {
  id: string;
  name: string;
  email: string;
  role: Role;
  rating?: number;
};

export default function SellerProfile({
  id,
  name,
  email,
  rating,
}: SellerProfileProps) {
  // State to hold assigned projects data for the seller
  const [assignedProjects, setAssignedProjects] = useState<Project[]>([]);
  // Loading state for asynchronous data fetching
  const [loading, setLoading] = useState(true);

  // Fetch assigned projects when the seller's id changes
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

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded shadow space-y-6">
      <h2 className="text-2xl font-bold">Seller Profile</h2>

      {/* Display basic seller info */}
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
      </div>

      {/* Assigned Projects Section */}
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

      {/* Optional: Include additional seller actions or info here */}
      {/* <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
        Edit Profile
      </button> */}
    </div>
  );
}
