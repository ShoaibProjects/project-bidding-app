"use client";
import { useEffect, useState } from "react";
import { getProjects } from "../services/projectService";
import { placeBid } from "../services/bidService";
import { Project } from "../types";
import { useUserStore } from "@/store/userStore";

export default function ProjectList({
  toRefresh,
  setToRefresh,
}: {
  toRefresh: boolean;
  setToRefresh?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [bidInputs, setBidInputs] = useState<Record<string, any>>({});
  const { user } = useUserStore();

  useEffect(() => {
    fetchProjects();
  }, [toRefresh]);

  const fetchProjects = async () => {
    const res = await getProjects();
    setProjects(res.data);
  };

  const handleBid = async (projectId: string) => {
    const bid = bidInputs[projectId];
    await placeBid({
      ...bid,
      projectId,
      sellerId: user?.id,
      sellerName: user?.email,
    });
    setToRefresh?.(!toRefresh);
    alert("Bid placed!");
    fetchProjects();
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Open Projects</h2>
      {projects.map((project) => (
        <div key={project.id} className="border p-4 mb-4 rounded shadow">
          <h3 className="font-bold">{project.title}</h3>
          <p>{project.description}</p>
          <p>
            <strong>Buyer:</strong>
            {project.buyer?.email}
          </p>
          <p>
            <strong>Budget:</strong> {project.budget}
          </p>
          <p>
            <strong>Deadline:</strong>{" "}
            {new Date(project.deadline).toLocaleString()}
          </p>

          {!project.bids.some((bid) => bid.sellerName === user?.email) && (
            <div className="mt-2">
              <h4 className="font-medium">Place a Bid</h4>
              <p className="border p-1 mr-2">{user?.email}</p>
              <input
                className="border p-1 mr-2"
                type="number"
                placeholder="Amount"
                onChange={(e) =>
                  setBidInputs((prev) => ({
                    ...prev,
                    [project.id]: {
                      ...prev[project.id],
                      amount: Number(e.target.value),
                    },
                  }))
                }
              />
              <input
                className="border p-1 mr-2"
                type="number"
                placeholder="Duration (days)"
                onChange={(e) =>
                  setBidInputs((prev) => ({
                    ...prev,
                    [project.id]: {
                      ...prev[project.id],
                      durationDays: Number(e.target.value),
                    },
                  }))
                }
              />
              <input
                className="border p-1 mr-2"
                placeholder="Message"
                onChange={(e) =>
                  setBidInputs((prev) => ({
                    ...prev,
                    [project.id]: {
                      ...prev[project.id],
                      message: e.target.value,
                    },
                  }))
                }
              />
              <button
                className="bg-green-600 text-white px-2 py-1 rounded"
                onClick={() => handleBid(project.id)}
              >
                Submit Bid
              </button>
            </div>
          )}

          {project.bids.length > 0 && (
            <div className="mt-2">
              <h4 className="font-medium">Bids</h4>
              <ul>
                {project.bids.map((bid) => (
                  <li
                    key={bid.id}
                    className="border p-2 my-1 flex justify-between items-center"
                  >
                    <span>
                      {bid.sellerName} - ${bid.amount} in {bid.durationDays}{" "}
                      days
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
