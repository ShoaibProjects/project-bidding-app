"use client";

import { useEffect, useState } from "react";
import { getSelectedProjectsForSeller, reuploadDeliverable, updateProjectProgress } from "../services/projectService";
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

  // Track which projects are in "edit mode"
const [editProjectIdMap, setEditProjectIdMap] = useState<Record<string, boolean>>({});

// Track the new progress values
const [editedProgressMap, setEditedProgressMap] = useState<Record<string, number>>({});


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

{/* 🔄 Editable Progress Section */}
<div className="mt-2">
  <div className="flex items-center justify-between">
    <p className="text-sm font-medium">
      Progress:
      <span className="font-semibold ml-1">
        {editProjectIdMap[project.id]
          ? (editedProgressMap[project.id] ?? project.progress ?? 0)
          : (project.progress ?? 0)}
        %
      </span>
    </p>

    {!editProjectIdMap[project.id] && (
      <button
        onClick={() => setEditProjectIdMap({ ...editProjectIdMap, [project.id]: true })}
        className="text-blue-600 hover:underline text-sm"
      >
        ✏️ Edit
      </button>
    )}
  </div>

  {!editProjectIdMap[project.id] ? (
    <div className="relative w-full h-3 bg-gray-200 rounded mt-1">
      <div
        className="absolute top-0 left-0 h-3 bg-blue-500 rounded"
        style={{ width: `${project.progress ?? 0}%` }}
      />
    </div>
  ) : (
    <>
      <input
        type="range"
        min="0"
        max="100"
        value={editedProgressMap[project.id] ?? project.progress ?? 0}
        onChange={(e) =>
          setEditedProgressMap({
            ...editedProgressMap,
            [project.id]: parseInt(e.target.value),
          })
        }
        className="w-full mt-2"
      />
      <div className="flex justify-end mt-2 gap-2">
        <button
          onClick={() =>
            setEditProjectIdMap({ ...editProjectIdMap, [project.id]: false })
          }
          className="px-3 py-1 bg-gray-200 text-sm rounded"
        >
          Cancel
        </button>
        <button
          onClick={async () => {
            const newProgress = editedProgressMap[project.id];
            try {
              await updateProjectProgress(project.id, newProgress);
              setToRefresh?.(!toRefresh);
              setEditProjectIdMap({ ...editProjectIdMap, [project.id]: false });
            } catch (err) {
              console.error("Failed to update progress", err);
            }
          }}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded"
        >
          Save
        </button>
      </div>
    </>
  )}
</div>



  {/* ⚠️ Changes Requested Indicator */}
  {project.status === "CHANGES_REQUESTED" && (
    <p className="text-yellow-600 font-semibold mt-2">
      ⚠️ Buyer requested changes – please re-upload the deliverable.
    </p>
  )}

          {/* 📎 Deliverable section */}
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

      {/* 🔁 Re-upload */}
      {setToRefresh && (
        <div className="mt-2">
          <label className="text-sm font-medium">Re-upload Deliverable:</label>
          <input
            type="file"
            accept=".pdf,.zip,.docx,.doc"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                await reuploadDeliverable(project.id, file);
                setToRefresh(!toRefresh);
              } catch (err) {
                console.error("Failed to re-upload deliverable", err);
              }
            }}
            className="mt-1 block text-sm"
          />
        </div>
      )}
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
