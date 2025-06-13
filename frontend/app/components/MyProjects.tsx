"use client";

import { useEffect, useState } from "react";
import {
  selectSeller,
  getProjectsByBuyerId,
  completeProject,
  unselectSeller,
} from "../services/projectService";
import { rateSeller } from "../services/userService";
import { Project } from "../types";
import { useUserStore } from "@/store/userStore";
import { ExternalLink } from "lucide-react";
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
 * Allows selecting sellers, marking projects as completed, and rating sellers.
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

  /**
   * Format ISO date string to a more readable local string
   * @param {string} date - ISO date string
   * @returns {string} Localized date string
   */
  const formatDate = (date: string) => new Date(date).toLocaleString();

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

        const sortedBids = getSortableList(project.bids || [], bidSortOption, "bid");

        return (
          <div
            key={project.id}
            className="border p-4 mb-6 rounded-lg shadow-sm bg-white"
          >
            <div className="mb-2">
              <h3 className="text-lg font-bold">{project.title}</h3>
              <p className="text-gray-700">{project.description}</p>
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
              </div>
            ) : (
              <p className="text-gray-500 mt-2">Deliverable not yet uploaded</p>
            )}

            {/* Display bids if any and no seller selected yet */}
            {project.bids.length > 0 && !project.selectedBid && (
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

                {project.status === "IN_PROGRESS" && (
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
