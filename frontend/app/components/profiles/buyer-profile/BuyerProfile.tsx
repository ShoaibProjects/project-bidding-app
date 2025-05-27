"use client";

import { useEffect, useState } from "react";
import { getProjectsByBuyerId } from "@/app/services/projectService";
import { Project, Role } from "@/app/types";

type BuyerProfileProps = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export default function BuyerProfile({ id, name, email }: BuyerProfileProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded shadow space-y-6">
      <h2 className="text-2xl font-bold">Buyer Profile</h2>

      <div className="space-y-2">
        <p>
          <span className="font-medium">Name:</span> {name || "N/A"}
        </p>
        <p>
          <span className="font-medium">Email:</span> {email || "N/A"}
        </p>
      </div>

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
                <span className="font-medium">{project.title}</span> — ${project.budget}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* <div>
        <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
          Edit Profile
        </button>
      </div> */}
    </div>
  );
}
