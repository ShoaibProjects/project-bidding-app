'use client'
import { useEffect, useState } from "react";
import {
  selectSeller,
  getProjectsByBuyerId,
  completeProject
} from "../services/projectService";
import { Project } from "../types";
import { useUserStore } from "@/store/userStore";

export default function MyProjects({
  toRefresh,
  setToRefresh,
}: {
  toRefresh: boolean;
  setToRefresh?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const { user } = useUserStore();

  useEffect(() => {
    if (user?.id) {
      fetchProjects(user.id);
    }
  }, [user?.id, toRefresh]);

  const fetchProjects = async (buyerId: string) => {
    const res = await getProjectsByBuyerId(buyerId);
    setProjects(res.data);
  };

  const handleSelect = async (projectId: string, bidId: string) => {
    await selectSeller(projectId, bidId);
    setToRefresh?.(!toRefresh);
    alert("Seller selected!");
  };

  const handleComplete = async (projectId: string) => {
    try {
      await completeProject(projectId);
      setToRefresh?.(!toRefresh);
      alert("Project marked as completed!");
    } catch (err) {
      console.error("Error completing project:", err);
      alert("Failed to mark project as completed.");
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">My Projects</h2>
      {projects.map((project) => (
        <div key={project.id} className="border p-4 mb-4 rounded shadow">
          <h3 className="font-bold">{project.title}</h3>
          <p>{project.description}</p>
          <p><strong>Budget:</strong> {project.budget}</p>
          <p><strong>Deadline:</strong> {new Date(project.deadline).toLocaleString()}</p>
          <p><strong>Status:</strong> {project.status}</p>

          {project.deliverable ? (
            <>
              <div>
                <p className="text-green-600 font-semibold">Deliverable Available</p>
                <a
                  href={project.deliverable.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  View File
                </a>
              </div>
              {project.status !== "COMPLETED" && (
                <div className="mt-2">
                  <button
                    className="bg-green-600 text-white px-3 py-1 rounded"
                    onClick={() => handleComplete(project.id)}
                  >
                    Mark as Completed
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500">Deliverable not yet uploaded</p>
          )}

          {project.bids.length > 0 && (
            <>
              <div className="mt-2">
                <h4 className="font-medium">Bids</h4>
                <ul>
                  {project.bids.map((bid) => (
                    <li
                      key={bid.id}
                      className="border p-2 my-1 flex justify-between items-center"
                    >
                      <span>
                        {bid.sellerName} - ${bid.amount} in {bid.durationDays} days
                      </span>
                      {project.status !== "IN_PROGRESS" && (
                        <button
                          className="bg-blue-600 text-white px-2 py-1 rounded"
                          onClick={() => handleSelect(project.id, bid.id)}
                        >
                          Select
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              {project.selectedBid && (
                <div>
                  <h4><strong>Selected Bid</strong></h4>
                  <div>
                    <span>
                      {project.selectedBid.sellerName} - ${project.selectedBid.amount} in {project.selectedBid.durationDays} days
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
