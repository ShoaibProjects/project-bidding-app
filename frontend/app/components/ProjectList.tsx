"use client";

import { useEffect, useState } from "react";
import { getProjects } from "../services/projectService";
import { placeBid } from "../services/bidService";
import { Project } from "../types";
import { useUserStore } from "@/store/userStore";
import { BadgeCheck, ClipboardList } from "lucide-react";
import { getSortableList } from "../utils/getSortableList";

// Define possible sorting options as a TypeScript union type
type SortOption =
  | "budget"
  | "deadline"
  | "recency";

/**
 * ProjectList Component
 * Displays a list of open projects fetched from the backend.
 * Allows the logged-in user to place bids on projects they haven't already bid on.
 * 
 * Props:
 *  - toRefresh: boolean flag to trigger re-fetching projects (e.g. after placing a bid)
 *  - setToRefresh?: optional setter function to toggle toRefresh flag in parent component
 */

type BidInput = {
  amount: number;
  durationDays: number;
  message: string;
};


export default function ProjectList({
  toRefresh,
  setToRefresh,
}: {
  toRefresh: boolean;
  setToRefresh?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  // State to hold the list of projects fetched from backend
  const [projects, setProjects] = useState<Project[]>([]);

  // State to hold the selected sorting option, default is 'recency'
  const [sortOption, setSortOption] = useState<SortOption>("recency");

  // Use custom hook to get the sorted projects based on the selected sort option
  // The hook handles sorting logic internally
  const sortedProjects = getSortableList(projects, sortOption, "project");

  // State to track bid form inputs for each project by project ID
  const [bidInputs, setBidInputs] = useState<Record<string, BidInput>>({});
  // Get the currently logged-in user from the global store
  const { user } = useUserStore();

  // Effect to fetch projects whenever 'toRefresh' changes
  useEffect(() => {
    fetchProjects();
  }, [toRefresh]);

  // Fetch projects from backend API and update state
  const fetchProjects = async () => {
    const res = await getProjects();
    setProjects(res.data);
  };

  /**
   * Handles placing a bid on a specific project.
   * Validates inputs, calls API, and refreshes project list on success.
   * @param projectId - ID of the project being bid on
   */
  const handleBid = async (projectId: string) => {
    const bid = bidInputs[projectId];

    // Basic validation: amount, durationDays must be positive and message non-empty
    if (
      !bid?.amount || bid.amount <= 0 ||
      !bid?.durationDays || bid.durationDays <= 0 ||
      !bid?.message || bid.message.trim() === ""
    ) {
      return alert("❗ Please enter a valid amount, duration, and message.");
    }

    try {
      // Call placeBid API with bid data + projectId + seller info
      await placeBid({
        ...bid,
        projectId,
        sellerId: user?.id? user.id : "",
        sellerName: user?.email? user.email : "",
      });
      // Toggle toRefresh flag to notify parent to refresh data (if setter provided)
      setToRefresh?.(!toRefresh);
      alert("✅ Bid placed!");
      fetchProjects(); // Refetch projects to show updated bids
    } catch (err) {
      console.error(err);
      alert("❌ Failed to place bid");
    }
  };

      /**
   * SortSelector Component
   *
   * Renders a dropdown/select input to choose the sorting criteria.
   * Calls `onChange` callback with the selected sort option on user change.
   *
   * Props:
   * - selected: current selected sort option
   * - onChange: function to call with new sort option
   */
  const SortSelector = ({
  selected,
  onChange,
}: {
  selected: SortOption;
  onChange: (value: SortOption) => void;
}) => {
  // Map of sort option values to user-friendly labels
  const sortOptions: Record<SortOption, string> = {
    budget: "Budget (High → Low)",
    deadline: "Deadline (Soonest First)",
    recency: "Recency (Newest First)",
  };

  return (
    <div className="mb-4 flex items-center gap-2">
      <label htmlFor="sort" className="text-sm font-medium">
        Sort by:
      </label>
      <select
        id="sort"
        value={selected}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="border border-gray-300 rounded px-3 py-1 text-sm"
      >
        {Object.entries(sortOptions).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <ClipboardList className="text-primary" /> Open Projects
      </h2>

      {/* Sort selector dropdown */}
      <SortSelector selected={sortOption} onChange={setSortOption} />

      <div className="grid gap-6">
        {sortedProjects.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
          >
            {/* Project details */}
            <div className="space-y-2 mb-4">
              <h3 className="text-xl font-semibold text-gray-800">{project.title}</h3>
              <p className="text-gray-600">{project.description}</p>
              <p className="text-sm text-gray-500">
                <strong>Buyer:</strong> {project.buyer?.email}
              </p>
              <div className="flex gap-4 text-sm text-gray-700">
                <span>
                  <strong>Budget:</strong> ${project.budget}
                </span>
                <span>
                  <strong>Deadline:</strong>{" "}
                  {new Date(project.deadline).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Bid form - only show if user hasn't already placed a bid on this project */}
            {!project.bids.some((bid) => bid.sellerName === user?.email) && (
              <div className="mt-4 border border-gray-200 bg-gray-50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-gray-700">Place a Bid</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {/* Bid amount input */}
                  <input
                    type="number"
                    placeholder="Amount ($)"
                    className="border border-gray-300 rounded px-3 py-2"
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
                  {/* Bid duration input */}
                  <input
                    type="number"
                    placeholder="Duration (days)"
                    className="border border-gray-300 rounded px-3 py-2"
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
                  {/* Bid message input */}
                  <input
                    placeholder="Message"
                    className="border border-gray-300 rounded px-3 py-2"
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
                </div>

                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mt-2 font-medium transition duration-100 transform hover:scale-[1.02]"
                  onClick={() => handleBid(project.id)}
                >
                  Submit Bid
                </button>
              </div>
            )}

            {/* Existing bids for the project */}
            {project.bids.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <BadgeCheck className="text-blue-500 w-4 h-4" />
                  Existing Bids
                </h4>
                <ul className="space-y-2">
                  {project.bids.map((bid) => (
                    <li
                      key={bid.id}
                      className="border border-gray-200 rounded p-3 flex justify-between items-center bg-gray-50"
                    >
                      <div>
                        <span className="font-medium">{bid.sellerName}</span>{" "}
                        <span className="text-sm text-gray-600">
                          bid ${bid.amount} for {bid.durationDays} days
                        </span>
                      </div>
                      <span className="text-sm italic text-gray-500">
                        &quot;{bid.message}&quot;
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
