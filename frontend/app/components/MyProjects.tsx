"use client";

import { useEffect, useState } from "react";
import {
  selectSeller,
  getProjectsByBuyerId,
  completeProject,
  unselectSeller,
  requestChanges,
  updateProjectDetails,
  cancelProject
} from "../services/projectService";
import { rateSeller } from "../services/userService";
import { Project } from "../types";
import { useUserStore } from "@/store/userStore";
import { ExternalLink, Edit3, Save, X } from "lucide-react";
import { getSortableList } from "../utils/getSortableList";
import { useRouter } from "next/navigation";

// Define possible sorting options as a TypeScript union type
type ProjectSortOption =
  | "budget"
  | "deadline"
  | "recency"
  | "status"
  | "alphabetical";

 type BidSortOption =
  | "rating"
  | "budget"
  | "deadline"
  | "recency"; 

/**
 * Component to display and manage projects for the logged-in buyer.
 * Allows selecting sellers, marking projects as completed, rating sellers, and editing project details.
 *
 * @param {object} props - Component props
 * @param {boolean} props.toRefresh - Boolean to trigger refresh of project list
 * @param {React.Dispatch<React.SetStateAction<boolean>>} [props.setToRefresh] - Setter to toggle refresh state
 * @returns JSX.Element
 */
export default function MyProjects({
  toRefresh,
  setToRefresh,
}: {
  toRefresh: boolean;
  setToRefresh?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  // State to store fetched projects
  const [projects, setProjects] = useState<Project[]>([]);

  // State to hold the selected sorting option, default is 'recency'
  const [projectSortOption, setProjectSortOption] = useState<ProjectSortOption>("recency");

  // State to hold the selected sorting option, default is 'recency'
  const [bidSortOption, setBidSortOption] = useState<BidSortOption>("recency");

  // Use custom hook to get the sorted projects based on the selected sort option
  // The hook handles sorting logic internally
  const sortedProjects = getSortableList(projects, projectSortOption, "project");

  // Loading state during fetching
  const [loading, setLoading] = useState(false);
  // Track submitting state per project (for async actions like select, complete, rate)
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  // Store rating inputs per project
  const [ratingInputs, setRatingInputs] = useState<Record<string, number>>({});
  // Store rating comments per project
  const [ratingComments, setRatingComments] = useState<Record<string, string>>(
    {}
  );

  // Edit mode states
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    description: string;
    deadline: string;
  }>({
    title: "",
    description: "",
    deadline: "",
  });

  // Get logged-in user info from store
  const { user } = useUserStore();

  const router = useRouter();

  // Fetch projects on user id or toRefresh change
  useEffect(() => {
    if (user?.id) fetchProjects(user.id);
  }, [user?.id, toRefresh]);

  /**
   * Fetch projects for a given buyer id
   * @param {string} buyerId - ID of the buyer user
   */
  const fetchProjects = async (buyerId: string) => {
    try {
      setLoading(true);
      const res = await getProjectsByBuyerId(buyerId);
      setProjects(res.data);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Start editing a project
   * @param {Project} project - Project to edit
   */
  const startEditing = (project: Project) => {
    setEditingProject(project.id);
    setEditForm({
      title: project.title,
      description: project.description,
      deadline: new Date(project.deadline).toISOString().slice(0, 16), // Format for datetime-local input
    });
  };

  /**
   * Cancel editing mode
   */
  const cancelEditing = () => {
    setEditingProject(null);
    setEditForm({
      title: "",
      description: "",
      deadline: "",
    });
  };

  /**
   * Handle form input changes during editing
   */
  const handleEditFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Save project changes
   * @param {string} projectId - ID of the project to update
   */
  const saveProjectChanges = async (projectId: string) => {
    if (!editForm.title.trim() || !editForm.description.trim() || !editForm.deadline) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      setSubmitting((prev) => ({ ...prev, [projectId]: true }));
      
      const updateData: { title?: string; description?: string; deadline?: string } = {};
      
      // Only include fields that have changed
      const currentProject = projects.find(p => p.id === projectId);
      if (currentProject) {
        if (editForm.title !== currentProject.title) {
          updateData.title = editForm.title;
        }
        if (editForm.description !== currentProject.description) {
          updateData.description = editForm.description;
        }
        const currentDeadline = new Date(currentProject.deadline).toISOString().slice(0, 16);
        if (editForm.deadline !== currentDeadline) {
          updateData.deadline = editForm.deadline;
        }
      }

      if (Object.keys(updateData).length === 0) {
        alert("No changes detected.");
        cancelEditing();
        return;
      }

      await updateProjectDetails(projectId, updateData);
      alert("Project updated successfully!");
      setToRefresh?.((prev) => !prev);
      cancelEditing();
    } catch (err) {
      console.error("Failed to update project:", err);
      alert("Failed to update project. Please try again.");
    } finally {
      setSubmitting((prev) => ({ ...prev, [projectId]: false }));
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
  const ProjectSortSelector = ({
  selected,
  onChange,
}: {
  selected: ProjectSortOption;
  onChange: (value: ProjectSortOption) => void;
}) => {
  // Map of sort option values to user-friendly labels
  const sortOptions: Record<ProjectSortOption, string> = {
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
        onChange={(e) => onChange(e.target.value as ProjectSortOption)}
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
  const BidSortSelector = ({
  selected,
  onChange,
}: {
  selected: BidSortOption;
  onChange: (value: BidSortOption) => void;
}) => {
  // Map of sort option values to user-friendly labels
  const sortOptions: Record<BidSortOption, string> = {
    rating: "Ratings (of Seller)",
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
        onChange={(e) => onChange(e.target.value as BidSortOption)}
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

  /**
   * Handle selecting a seller's bid for a project
   * @param {string} projectId - ID of the project
   * @param {string} bidId - ID of the bid to select
   */
  const handleSelect = async (projectId: string, bidId: string) => {
    try {
      setSubmitting((prev) => ({ ...prev, [projectId]: true }));
      await selectSeller(projectId, bidId);
      alert("Seller selected!");
      setToRefresh?.((prev) => !prev);
    } catch (err) {
      console.log(err);
      alert("Failed to select seller.");
    } finally {
      setSubmitting((prev) => ({ ...prev, [projectId]: false }));
    }
  };

  const removeSelectedSeller = async (projectId: string) => {
    const confirmed = confirm(
      "Are you sure you want to remove the selected seller? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      setSubmitting((prev) => ({ ...prev, [projectId]: true }));
      await unselectSeller(projectId); // Make sure this function exists in your `projectService`
      alert("Seller removed from the project.");
      setToRefresh?.((prev) => !prev);
    } catch (err) {
      console.error(err);
      alert("Failed to remove the seller.");
    } finally {
      setSubmitting((prev) => ({ ...prev, [projectId]: false }));
    }
  };

  /**
   * Handle marking a project as completed
   * @param {string} projectId - ID of the project to mark complete
   */
  const handleComplete = async (projectId: string) => {
    try {
      setSubmitting((prev) => ({ ...prev, [projectId]: true }));
      await completeProject(projectId);
      alert("Project marked as completed!");
      setToRefresh?.((prev) => !prev);
    } catch (err) {
      console.log(err);
      alert("Failed to mark as completed.");
    } finally {
      setSubmitting((prev) => ({ ...prev, [projectId]: false }));
    }
  };

  /**
   * Handle submitting a rating for a completed project
   * @param {string} projectId - ID of the project being rated
   */
  const handleRatingSubmit = async (projectId: string) => {
    const value = ratingInputs[projectId];
    const comment = ratingComments[projectId] || "";

    // Validate rating value
    if (!value || value < 1 || value > 5) {
      alert("Please enter a rating between 1 and 5.");
      return;
    }

    try {
      setSubmitting((prev) => ({ ...prev, [projectId]: true }));
      await rateSeller({ value, comment, projectId });
      alert("Rating submitted!");
      setToRefresh?.((prev) => !prev);
    } catch (err) {
      console.log(err);
      alert("Failed to submit rating.");
    } finally {
      setSubmitting((prev) => ({ ...prev, [projectId]: false }));
    }
  };

 const handleChangeRequest = async (projectId: string) => {
   try {
     setSubmitting(prev => ({ ...prev, [projectId]: true }));
     await requestChanges(projectId);
     alert("Change request sent!");
     setToRefresh?.(prev => !prev);
   } catch (err) {
     console.error(err);
     alert("Failed to send change request.");
   } finally {
     setSubmitting(prev => ({ ...prev, [projectId]: false }));
   }
 };

 // Usage in a React component
const handleCancelProject = async (projectId: string) => {
  const confirmed = confirm(
    "Are you sure you want to cancel this project? This action cannot be undone."
  );
  if (!confirmed) return;

  try {
    setSubmitting((prev) => ({ ...prev, [projectId]: true }));
    await cancelProject(projectId);
    alert("Project cancelled successfully!");
    setToRefresh?.((prev) => !prev);
  } catch (err) {
    console.error("Failed to cancel project:", err);
    alert("Failed to cancel project. Please try again.");
  } finally {
    setSubmitting((prev) => ({ ...prev, [projectId]: false }));
  }
};

  /**
   * Format ISO date string to a more readable local string
   * @param {string} date - ISO date string
   * @returns {string} Localized date string
   */
  const formatDate = (date: string) => new Date(date).toLocaleString();

  /**
   * Check if project can be edited (only PENDING or IN_PROGRESS projects should be editable)
   * @param {Project} project - Project to check
   * @returns {boolean} Whether project can be edited
   */
  const canEditProject = (project: Project) => {
    return (project.status === "PENDING" || project.status === "IN_PROGRESS");
  };

  // Show loading text if fetching projects
  if (loading) return <p className="mt-4 text-gray-600">Loading projects...</p>;

  // Show message if no projects are available
  if (!projects.length)
    return <p className="mt-4 text-gray-600">No projects yet.</p>;

  // Main JSX rendering projects and actions
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">My Projects</h2>

      {/* Sort selector dropdown */}
      <ProjectSortSelector selected={projectSortOption} onChange={setProjectSortOption} />

      {sortedProjects.map((project) => {
        const isSubmitting = submitting[project.id] || false;
        const isEditing = editingProject === project.id;

        const sortedBids = getSortableList(project.bids || [], bidSortOption, "bid");

        return (
          <div
            key={project.id}
            className="border p-4 mb-6 rounded-lg shadow-sm bg-white"
          >
            {/* Project Header with Edit Button */}
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                {isEditing ? (
                  // Edit mode
                  <div className="space-y-3">
                    <input
                      name="title"
                      value={editForm.title}
                      onChange={handleEditFormChange}
                      className="w-full text-lg font-bold border border-gray-300 rounded px-2 py-1"
                      placeholder="Project title"
                    />
                    <textarea
                      name="description"
                      value={editForm.description}
                      onChange={handleEditFormChange}
                      className="w-full text-gray-700 border border-gray-300 rounded px-2 py-1 min-h-20"
                      placeholder="Project description"
                    />
                    <div>
                      <label className="block text-sm font-medium mb-1">Deadline:</label>
                      <input
                        name="deadline"
                        type="datetime-local"
                        value={editForm.deadline}
                        onChange={handleEditFormChange}
                        className="border border-gray-300 rounded px-2 py-1"
                      />
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div>
                    <h3 className="text-lg font-bold">{project.title}</h3>
                    <p className="text-gray-700">{project.description}</p>
                  </div>
                )}
              </div>

              {/* Edit/Save/Cancel buttons */}
              <div className="flex gap-2 ml-4">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => saveProjectChanges(project.id)}
                      disabled={isSubmitting}
                      className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded disabled:opacity-50 text-sm"
                    >
                      <Save size={14} />
                      {isSubmitting ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={cancelEditing}
                      disabled={isSubmitting}
                      className="flex items-center gap-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded disabled:opacity-50 text-sm"
                    >
                      <X size={14} />
                      Cancel
                    </button>
                  </>
                ) : (
                  canEditProject(project) && (
                    <div>
                                          <button
                      onClick={() => startEditing(project)}
                      className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                    >
                      <Edit3 size={14} />
                      Edit
                    </button>
                        <button
      onClick={() => handleCancelProject(project.id)}
      disabled={isSubmitting}
      className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded disabled:opacity-50 text-sm"
    >
      <X size={14} />
      Cancel Project
    </button>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Project Details */}
            {!isEditing && (
              <div className="mb-2">
                <p>
                  <strong>Budget:</strong> ${project.budget}
                </p>
                <p>
                  <strong>Deadline:</strong> {formatDate(project.deadline)}
                </p>
                <p>
                  <strong>Status:</strong> {project.status}
                </p>
              </div>
            )}

            {/* Read‑only progress bar */}
            <div className="my-2">
              <label htmlFor={`progress-${project.id}`} className="text-sm">
                Progress: {project.progress ?? 0}%
              </label>
              <progress
                id={`progress-${project.id}`}
                value={project.progress ?? 0}
                max={100}
                className="w-full h-2 mt-1"
              />
            </div>

            {/* Deliverable section */}
            {project.deliverable ? (
              <div className="mt-2 flex flex-col">
                <p className="text-green-600 font-medium">
                  Deliverable Uploaded
                </p>
                <a
                  href={project.deliverable.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800 flex font-bold"
                >
                  View File <ExternalLink size={12} />
                </a>
                {/* Button to mark project completed if not already completed */}
                {project.status !== "COMPLETED" && (
                  <button
                    onClick={() => handleComplete(project.id)}
                    disabled={isSubmitting}
                    className="mt-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded disabled:opacity-50 font-medium transition duration-100 transform hover:scale-[1.02]"
                  >
                    {isSubmitting ? "Processing..." : "Mark as Completed"}
                  </button>
                )}
                {/* Request Change on REVIEW */}
                {project.status === "IN_REVIEW" && (
                  <button
                    onClick={() => handleChangeRequest(project.id)}
                    disabled={submitting[project.id]}
                    className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded disabled:opacity-50"
                  >
                    {submitting[project.id] ? "Sending…" : "Request Change"}
                  </button>
                )}
              </div>
            ) : (
              <p className="text-gray-500 mt-2">Deliverable not yet uploaded</p>
            )}

            {/* Display bids if any and no seller selected yet */}
            {project.bids.length > 0 && !project.selectedBid && (project.status!="CANCELLED") && (
              <div className="mt-4">
                <h4 className="font-medium">Bids</h4>
                {/* Show bid sort dropdown */}
                <BidSortSelector selected={bidSortOption} onChange={setBidSortOption} />
                <ul>
                  {sortedBids.map((bid) => (
                    <li
                      key={bid.id}
                      className="flex justify-between items-center border px-3 py-2 rounded mb-2"
                    >
                      <span>
                        {bid.sellerName} - ${bid.amount} in {bid.durationDays}{" "}
                        days
                      </span>
                      <button
                        onClick={() => handleSelect(project.id, bid.id)}
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded disabled:opacity-50 font-medium transition duration-100 transform hover:scale-[1.02]"
                      >
                        {isSubmitting ? "Selecting..." : "Select"}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Show selected bid details */}
            {project.selectedBid && (
              <div className="mt-4">
                <h4 className="font-medium">Selected Bid</h4>
                <p className="text-gray-800">
                  {project.selectedBid.sellerName} - $
                  {project.selectedBid.amount} in{" "}
                  {project.selectedBid.durationDays} days
                </p>
                <button onClick={()=>{
                  router.push(`/profile/${project.selectedBid?.sellerId}`)
                }}>View profile</button>

                <button onClick={()=>{
                  router.push(`/chats?sellerId=${project.selectedBid?.sellerId}`)
                }}>Chat</button>

                {(project.status === "IN_PROGRESS" || project.status === "IN_REVIEW" || project.status === "CHANGES_REQUESTED") && (
                  <button
                    onClick={() => removeSelectedSeller(project.id)}
                    disabled={isSubmitting}
                    className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded disabled:opacity-50 font-medium transition duration-100 transform hover:scale-[1.02]"
                  >
                    {isSubmitting ? "Removing..." : "Remove Seller"}
                  </button>
                )}
              </div>
            )}

            {/* Rating section for completed projects */}
            {project.status === "COMPLETED" && (
              <div className="mt-4">
                <h4 className="font-medium">Ratings</h4>
                {project.rating ? (
                  <div>
                    <p className="flex items-center">
                      <strong className="mr-2">Rating:</strong>
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
                    {project.rating?.comment && (
                      <p className="italic mt-1">
                        &quot;{project.rating.comment}&quot;
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="text-sm">Wanna rate this project?</span>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          onClick={() =>
                            setRatingInputs((prev) => ({
                              ...prev,
                              [project.id]: star,
                            }))
                          }
                          className={`cursor-pointer text-2xl ${
                            (ratingInputs[project.id] || 0) >= star
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>

                    <label className="block">
                      <span className="text-sm">Comment (optional)</span>
                      <textarea
                        rows={2}
                        value={ratingComments[project.id] || ""}
                        onChange={(e) =>
                          setRatingComments((prev) => ({
                            ...prev,
                            [project.id]: e.target.value,
                          }))
                        }
                        className="border rounded px-2 py-1 mt-1 w-full max-h-20 min-h-10"
                      />
                    </label>

                    <button
                      onClick={() => handleRatingSubmit(project.id)}
                      disabled={isSubmitting}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded disabled:opacity-50 font-medium transition duration-100 transform hover:scale-[1.02]"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Rating"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}