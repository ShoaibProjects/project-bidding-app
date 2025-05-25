"use client";

import { useEffect, useState } from "react";
import { getSelectedProjectsForSeller } from "../services/projectService";
import { Project } from "../types";
import { useUserStore } from "@/store/userStore";
import UploadDeliverable from "./UploadDeliverable";
import { ExternalLink } from "lucide-react";
import { getSortableList } from "../utils/getSortableList";

// Define possible sorting options as a TypeScript union type
type SortOption =
  | "budget"
  | "deadline"
  | "recency"
  | "status"
  | "alphabetical";

/**
 * AssignedProjectList Component
 *
 * Displays a list of projects assigned to the logged-in seller.
 * Allows uploading deliverables if not already uploaded.
 * Shows project details, status, buyer info, and ratings if completed.
 *
 * Props:
 * - toRefresh: boolean flag to trigger data refresh
 * - setToRefresh: optional setter to update refresh flag (for child components)
 */
export default function AssignedProjectList({
  toRefresh,
  setToRefresh,
}: {
  toRefresh: boolean;
  setToRefresh?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  // State to hold the assigned projects data
  const [projects, setProjects] = useState<Project[]>([]);

  // State to hold the selected sorting option, default is 'recency'
  const [sortOption, setSortOption] = useState<SortOption>("recency");

  // Use custom hook to get the sorted projects based on the selected sort option
  // The hook handles sorting logic internally
  const sortedProjects = getSortableList(projects, sortOption, "project");

  // Loading state for async data fetch
  const [loading, setLoading] = useState(true);

  // Error state for handling fetch failures
  const [error, setError] = useState<string | null>(null);

  // Get logged-in user from global store
  const { user } = useUserStore();

  // Fetch assigned projects on component mount or when user ID or refresh flag changes
  useEffect(() => {
    if (user?.id) {
      fetchProjects(user.id);
    }
  }, [user?.id, toRefresh]);

  /**
   * Fetch projects assigned to the seller from API
   * @param sellerId - logged-in seller's user ID
   */
  const fetchProjects = async (sellerId: string) => {
    try {
      setLoading(true);
      const res = await getSelectedProjectsForSeller(sellerId);
      setProjects(res.data);
      setError(null);
    } catch (err: unknown) {
      console.error("Failed to fetch assigned projects", err);
      setError("Failed to load assigned projects.");
    } finally {
      setLoading(false);
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
    status: "Status",
    alphabetical: "Alphabetical (A → Z)",
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
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-6">Your Assigned Projects</h2>

      {/* Sort selector dropdown */}
      <SortSelector selected={sortOption} onChange={setSortOption} />

      {/* Loading state message */}
      {loading && <p>Loading assigned projects...</p>}

      {/* Error message if fetching fails */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Message if no projects assigned */}
      {!loading && projects.length === 0 && (
        <p className="text-gray-500">You have no assigned projects yet.</p>
      )}

      {/* List of assigned projects */}
      {sortedProjects.map((project) => (
        <div key={project.id} className="border p-4 mb-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">{project.title}</h3>
          <p className="text-sm text-gray-700 mb-1">{project.description}</p>
          <p>
            <strong>Budget:</strong> {project.budget}
          </p>
          <p>
            <strong>Deadline:</strong>{" "}
            {new Date(project.deadline).toLocaleString()}
          </p>
          <p>
            <strong>Status:</strong> {project.status}
          </p>
          <p>
            <strong>Buyer:</strong> {project.buyer?.email}
          </p>

          {/* Deliverable section */}
          {project.deliverable ? (
            <div>
              <p className="text-green-600 font-semibold">
                Deliverable Available
              </p>
              <a
                href={project.deliverable.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800 flex font-bold"
              >
                View File <ExternalLink size={12} />
              </a>
            </div>
          ) : (
            <>
              <p className="text-gray-500">Deliverable not yet uploaded</p>
              <p>
                <strong>Upload file</strong>
              </p>
              {/* Show upload component if setToRefresh function is provided */}
              {setToRefresh && (
                <UploadDeliverable
                  projectId={project.id}
                  toRefresh={toRefresh}
                  setToRefresh={setToRefresh}
                />
              )}
            </>
          )}

          {/* Ratings section shown only if project is completed and rated */}
          {project.status === "COMPLETED" && project.rating && (
            <div className="mt-4">
              <h4 className="font-medium">Ratings</h4>
              <div>
                <p className="flex items-center">
                  <strong className="mr-2">Rating:</strong>
                  {/* Render stars for rating */}
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-xl ${
                        (project.rating?.value ?? 0) >= star
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </p>
                {/* Optional rating comment */}
                {project.rating?.comment && (
                  <p className="italic mt-1">&quot;{project.rating.comment}&quot;</p>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
