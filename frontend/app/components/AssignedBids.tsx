'use client';

import { useEffect, useState } from "react";
import { getSelectedProjectsForSeller } from "../services/projectService";
import { Project } from "../types";
import { useUserStore } from '@/store/userStore';
import UploadDeliverable from "./UploadDeliverable";

export default function AssignedProjectList(
  {
  toRefresh,
  setToRefresh,
}: {
  toRefresh: boolean;
  setToRefresh?: React.Dispatch<React.SetStateAction<boolean>>;
}
) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {user} = useUserStore();

  useEffect(() => {
    if (user?.id) {
      fetchProjects(user.id);
    }
  }, [user?.id, toRefresh]);

  const fetchProjects = async (sellerId: string) => {
    try {
      setLoading(true);
      const res = await getSelectedProjectsForSeller(sellerId);
      setProjects(res.data);
    } catch (err) {
      console.error("Failed to fetch assigned projects", err);
      setError("Failed to load assigned projects.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-6">Your Assigned Projects</h2>

      {loading && <p>Loading assigned projects...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && projects.length === 0 && (
        <p className="text-gray-500">You have no assigned projects yet.</p>
      )}

      {projects.map((project) => (
        <div key={project.id} className="border p-4 mb-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">{project.title}</h3>
          <p className="text-sm text-gray-700 mb-1">{project.description}</p>
          <p><strong>Budget:</strong> {project.budget}</p>
          <p><strong>Deadline:</strong> {new Date(project.deadline).toLocaleString()}</p>
          <p><strong>Status:</strong> {project.status}</p>
          <p><strong>Buyer:</strong> {project.buyer?.email}</p>

{project.deliverable ? (
  <div>
    <p className="text-green-600 font-semibold">Deliverable Available</p>
    <a href={project.deliverable.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
      View File
    </a>
  </div>
) : (
  <>
    <p className="text-gray-500">Deliverable not yet uploaded</p>
  <p><strong>Upload file</strong></p>
  <UploadDeliverable projectId={project.id} toRefresh={toRefresh} setToRefresh={setToRefresh}/>
  </>
)}

        </div>
      ))}
    </div>
  );
}
